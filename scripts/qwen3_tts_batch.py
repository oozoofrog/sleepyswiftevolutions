#!/usr/bin/env python3
"""Single-load local MLX Qwen3-TTS batch synthesizer + optional Qwen3-ForcedAligner."""

from sentence_ending import soften_ending
from voice_denoise import denoise_voice
import re
import gc
import json
import os
import sys
import tempfile
import unicodedata
from pathlib import Path

# Enforce strictly offline local cache paths before importing HuggingFace / mlx_audio
AI_BASE = Path("/Volumes/eyedisk/AI")
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_HUB_CACHE", str(AI_BASE / "Cache/huggingface/hub"))
os.environ.setdefault("HF_XET_CACHE", str(AI_BASE / "Cache/huggingface/xet"))
os.environ.setdefault("HF_ASSETS_CACHE", str(AI_BASE / "Cache/huggingface/assets"))
os.environ.setdefault("XDG_CACHE_HOME", str(AI_BASE / "Cache/xdg"))

import mlx.core as mx
import numpy as np
import wave
from mlx_audio.stt.utils import load_model as load_stt_model
from mlx_audio.tts.utils import load_model as load_tts_model
from mlx_audio.utils import load_audio


def to_nfc(value: str | None) -> str:
    return unicodedata.normalize("NFC", value or "")


def write_json_atomic(target_path: Path, payload: dict) -> None:
    target_path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=".qwen3_out_", suffix=".json", dir=str(target_path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(tmp_name, target_path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)


ENDING_PROMPT = "잠시 쉬어 볼까요?"


def release_final_vowel(row, spans, pause):
    """Keep the sentence through the quiet boundary before the extra spoken phrase."""
    chars = [(c, span) for span in spans for c in span["text"] if c.isalnum()]
    suffix = "".join(c for c in ENDING_PROMPT if c.isalnum())
    boundary = len(chars) - len(suffix)
    if boundary < 1 or "".join(c for c, _ in chars[boundary:]) != suffix or chars[boundary-1][0] != "다":
        raise ValueError("Could not align the sentence-final vowel and following prompt")
    last = chars[boundary-1][1]
    following = chars[boundary][1]["startSec"]
    with wave.open(row["wavPath"]) as wav:
        rate = wav.getframerate()
        x = np.frombuffer(wav.readframes(wav.getnframes()), "<i2").astype(float)
    block = rate // 100
    rms = np.sqrt(np.mean(x[:len(x)//block*block].reshape(-1, block)**2, axis=1))
    center = (last["endSec"] + following) / 2
    lo = max(0, int((center - .24)*100))
    hi = min(len(rms)-4, int((center + .24)*100))
    quiet = min(range(lo, hi+1), key=lambda n: rms[n:n+4].mean() + abs(n/100-center)*80)
    active = np.flatnonzero(rms[:quiet+1] > max(36, rms[:quiet+1].max()*.025))
    stop = min((quiet+2)*block, (active[-1]+7)*block)
    start = max(0,(active[0]-5)*block)
    ramp = np.clip((np.arange(stop)/rate - max(last["startSec"]-.05,active[-1]/100-.30))/.10, 0, 1)
    take = x[:stop]*(1+.75*ramp)
    take[-block:] *= np.linspace(1,0,block)
    pcm = take[start:].clip(-32768,32767).astype("<i2")
    with wave.open(row["wavPath"], "wb") as wav:
        wav.setparams((1,2,rate,0,"NONE",""))
        wav.writeframes(pcm.tobytes())
        wav.writeframes(bytes(2*round(pause*rate)))
    row["durationSec"] = len(pcm)/rate
    row["onsetSec"] = max(0, active[0]*block-start)/rate
    return [{**s, "startSec": max(0,s["startSec"]-start/rate),
             "endSec": min(row["durationSec"],max(0,s["endSec"]-start/rate))}
            for s in spans if s["startSec"] < following and s["startSec"] < stop/rate]


OPENING_PROMPT = "이제 시작합니다."


def remove_opening_prompt(row, spans):
    prefix = "".join(c for c in OPENING_PROMPT if c.isalnum())
    tokens = ""
    for index, span in enumerate(spans):
        tokens += "".join(c for c in span["text"] if c.isalnum())
        if tokens == prefix:
            break
        if not prefix.startswith(tokens):
            raise ValueError("Could not align opening prompt")
    if tokens != prefix or index + 1 >= len(spans):
        raise ValueError("Missing opening sentence after prompt")
    following = spans[index+1:]
    with wave.open(row["wavPath"]) as source:
        rate = source.getframerate()
        samples = np.frombuffer(source.readframes(source.getnframes()), "<i2").copy()
    block = max(1,rate//100)
    start = round((span["endSec"]+.05)*rate)
    stop = round((following[0]["startSec"]-.10)*rate)
    if stop <= start:
        raise ValueError("No aligned pause before opening sentence")
    cut = min(range(start,stop,max(1,block//2)),
              key=lambda n: np.mean(samples[n:n+2*block].astype(float)**2)) + block
    samples = samples[cut:]
    samples[:block] = samples[:block]*np.linspace(0,1,block)
    with wave.open(row["wavPath"], "wb") as target:
        target.setparams((1,2,rate,0,"NONE",""))
        target.writeframes(samples.tobytes())
    row["durationSec"] -= cut/rate
    row["onsetSec"] = max(0,following[0]["startSec"]-cut/rate)
    return [{**s, "startSec":max(0,s["startSec"]-cut/rate),
             "endSec":max(0,s["endSec"]-cut/rate)} for s in following]


def run_job(job_path: Path) -> None:
    job = json.loads(job_path.read_text(encoding="utf-8"))
    mode = job["mode"]  # "clone" | "custom-voice" | "voice-design"
    model_path = job["modelPath"]
    language = job.get("language", "Korean")
    voice = job.get("voice")
    instruct = to_nfc(job.get("instruct"))
    ref_audio_path = job.get("refAudio")
    ref_text = to_nfc(job.get("refText"))
    temperature = float(job.get("temperature", 0.7))
    seed = job.get("seed")
    items = job.get("items", [])

    # ------------------------------------------------------------------
    # Phase 1: Load Qwen3-TTS once and synthesize all requested clips
    # ------------------------------------------------------------------
    tts_model = load_tts_model(model_path)
    ref_audio_arr = None
    if mode == "clone":
        if not ref_audio_path:
            raise ValueError("refAudio is required in clone mode")
        ref_audio_arr = load_audio(ref_audio_path, sample_rate=tts_model.sample_rate)

    synthesized = []
    for idx, item in enumerate(items):
        item_id = item["id"]
        text_nfc = to_nfc(item["text"])
        wav_path = Path(item["wavPath"])
        wav_path.parent.mkdir(parents=True, exist_ok=True)

        if seed is not None:
            mx.random.seed(int(seed) + idx)

        guard = (
            mode == "clone"
            and item.get("language", language) == "Korean"
            and job.get("useAligner", True)
            and bool(job.get("alignerModelPath"))
            and Path(job["alignerModelPath"]).is_dir()
            and re.search(r"""다[.!。！]["'”’）)]*$""", text_nfc.strip()) is not None
        )
        if mode == "clone" and item.get("language", language) == "Korean" and re.search(
            r"""다[.!。！]["'”’）)]*$""", text_nfc.strip()
        ) and not guard:
            raise ValueError("Korean clone sentence endings require an installed and enabled forced aligner")

        opening = mode == "clone" and item.get("openingLeadIn", False)
        if opening and not (job.get("useAligner", True) and job.get("alignerModelPath")
                            and Path(job["alignerModelPath"]).is_dir()):
            raise ValueError("Opening retake requires forced alignment")
        spoken = (OPENING_PROMPT + "  " if opening else "") + text_nfc
        gen_kwargs = {
            "text": spoken + ("  " + ENDING_PROMPT if guard else ""),
            "lang_code": item.get("language", language),
            "temperature": temperature,
            "max_tokens": 4096,
            "split_pattern": "\n",
        }
        if mode == "clone":
            gen_kwargs["ref_audio"] = ref_audio_arr
            gen_kwargs["ref_text"] = ref_text
        elif mode == "custom-voice":
            if voice:
                gen_kwargs["voice"] = voice
            if instruct:
                gen_kwargs["instruct"] = instruct
        elif mode == "voice-design":
            if instruct:
                gen_kwargs["instruct"] = instruct

        chunks = []
        sample_rate = getattr(tts_model, "sample_rate", 24000)
        for result in tts_model.generate(**gen_kwargs):
            mx.eval(result.audio)
            arr = np.asarray(result.audio, dtype=np.float32).reshape(-1)
            if arr.size > 0:
                chunks.append(arr)
                sample_rate = getattr(result, "sample_rate", sample_rate)

        if not chunks:
            raise RuntimeError(f"Qwen3-TTS produced empty audio for item '{item_id}'")

        if len(chunks) == 1:
            combined = chunks[0]
        else:
            pause = np.zeros(int(sample_rate * 0.12), dtype=np.float32)
            parts = []
            for c_idx, chunk in enumerate(chunks):
                if c_idx > 0:
                    parts.append(pause)
                parts.append(chunk)
            combined = np.concatenate(parts)

        pcm = (np.clip(combined, -1, 1) * 32767).astype("<i2").tobytes()
        if not guard and item.get("language") == "Korean" and re.search(r"다[.!。！]$", text_nfc.strip()):
            pcm = soften_ending(pcm, sample_rate)
        with wave.open(str(wav_path), "wb") as wav:
            wav.setparams((1, 2, int(sample_rate), 0, "NONE", "not compressed"))
            wav.writeframes(pcm)
            pause_samples = round(item.get("pauseAfterSec", 0) * sample_rate)
            if pause_samples:
                wav.writeframes(bytes(pause_samples * 2))
        duration_sec = len(pcm) / (2 * sample_rate)

        # A generated clip may start with silence. Locate the first audible 10 ms block.
        onset_sec = 0.0
        if item.get("measureOnset"):
            block = max(1, sample_rate // 100)
            samples = combined[:combined.size // block * block]
            if samples.size:
                rms = np.sqrt(np.mean(samples.reshape(-1, block) ** 2, axis=1))
                active = np.flatnonzero(rms > max(0.0001, rms.max() * 0.035))
                if active.size:
                    onset_sec = float(active[0] * block / sample_rate)

        synthesized.append(
            {
                "id": item_id,
                "text": text_nfc,
                "language": item.get("language", language),
                "align": item.get("align", True) or bool(guard) or opening,
                "opening": opening,
                "alignmentText": gen_kwargs["text"],
                "guard": bool(guard),
                "pause": item.get("pauseAfterSec", 0),
                "wavPath": str(wav_path),
                "sampleRate": int(sample_rate),
                "durationSec": duration_sec,
                "onsetSec": onset_sec,
                "alignedItems": [],
                "alignError": None,
            }
        )

    # Free TTS model memory before loading ForcedAligner (24 GB Mac budget)
    del ref_audio_arr
    del tts_model
    gc.collect()
    mx.clear_cache()

    # ------------------------------------------------------------------
    # Phase 2: Forced alignment for exact Korean subtitle timestamps
    # ------------------------------------------------------------------
    aligner_path = job.get("alignerModelPath")
    use_aligner = bool(job.get("useAligner", True)) and aligner_path and Path(aligner_path).exists() and any(
        row["align"] for row in synthesized
    )

    if use_aligner:
        aligner = load_stt_model(aligner_path)
        try:
            for row in synthesized:
                if not row["align"]:
                    continue
                try:
                    aligned = aligner.generate(
                        audio=row["wavPath"],
                        text=row["alignmentText"],
                        language=row["language"],
                    )
                    spans = []
                    for token in aligned.items:
                        start_sec = max(0.0, round(float(token.start_time), 3))
                        end_sec = max(start_sec, round(float(token.end_time), 3))
                        spans.append(
                            {
                                "text": to_nfc(token.text),
                                "startSec": start_sec,
                                "endSec": end_sec,
                            }
                        )
                    spans = release_final_vowel(row, spans, row["pause"]) if row["guard"] else spans
                    row["alignedItems"] = remove_opening_prompt(row, spans) if row["opening"] else spans
                except Exception as exc:  # pragma: no cover - graceful fallback per item
                    if row["guard"] or row["opening"]:
                        raise RuntimeError(f"Ending alignment failed for {row['id']}") from exc
                    row["alignError"] = str(exc)
        finally:
            del aligner
            gc.collect()
            mx.clear_cache()

    if mode == "clone":
        for row in synthesized:
            with wave.open(row["wavPath"]) as source:
                params = source.getparams()
                pcm = source.readframes(source.getnframes())
            clean = denoise_voice(pcm, params.framerate)
            with wave.open(row["wavPath"], "wb") as target:
                target.setparams(params)
                target.writeframes(clean)

    output_path = Path(job["outputJsonPath"])
    write_json_atomic(
        output_path,
        {
            "mode": mode,
            "modelPath": model_path,
            "alignerUsed": bool(use_aligner),
            "items": synthesized,
        },
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: qwen3_tts_batch.py <job.json>", file=sys.stderr)
        sys.exit(2)
    run_job(Path(sys.argv[1]))
