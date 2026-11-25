#!/usr/bin/env python3
"""Single-load local MLX Qwen3-TTS batch synthesizer + optional Qwen3-ForcedAligner."""

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

        gen_kwargs = {
            "text": text_nfc,
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

        with wave.open(str(wav_path), "wb") as wav:
            wav.setparams((1, 2, int(sample_rate), 0, "NONE", "not compressed"))
            wav.writeframes((np.clip(combined, -1, 1) * 32767).astype("<i2").tobytes())
            pause_samples = round(item.get("pauseAfterSec", 0) * sample_rate)
            if pause_samples:
                wav.writeframes(bytes(pause_samples * 2))
        duration_sec = combined.shape[0] / sample_rate

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
                "align": item.get("align", True),
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
                        text=row["text"],
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
                    row["alignedItems"] = spans
                except Exception as exc:  # pragma: no cover - graceful fallback per item
                    row["alignError"] = str(exc)
        finally:
            del aligner
            gc.collect()
            mx.clear_cache()

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
