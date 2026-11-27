import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { getConfig } from "../../config/env";
import { probeAudioDurationSec } from "../../lib/audio-probe";
import { narrationSegments, sentencePauseSec } from "../../lib/pacing";
import { PROJECT_ROOT } from "../../lib/paths";
import { groupAlignedWordsToCues } from "../../lib/subtitle";
import type { Scene, SubtitleCue } from "../../schema/script";
import { loadVoiceProfile } from "../voice-profile";
import type { TtsSynthesizeResult } from "./types";

const run = promisify(execFile);

import { endingDigest, needsVowelRelease } from "../ending-check";

interface Clip {
  guard?: boolean;
  onsetSec: number;
  durationSec: number;
  alignedItems: SubtitleCue[];
  alignError?: string;
}

export async function synthesizeQwenScenes(
  scenes: Scene[], outDir: string, provider: "qwen3-clone" | "qwen3-tts", selectedVoice?: string, openingSceneId?: string, cloneTempo = 1,
): Promise<Array<{result: TtsSynthesizeResult; warnings: string[]}>> {
  const config = getConfig().tts;
  const clone = provider === "qwen3-clone";
  const profile = clone ? await loadVoiceProfile() : null;
  if (clone && !profile) {
    throw new Error("내 목소리 녹음이 필요합니다. VOICE_PROFILE_AUDIO와 VOICE_PROFILE_TEXT를 설정하세요.");
  }
  const voice = clone ? "voice-profile" : selectedVoice || config.qwen3Voice;
  const work = await fs.mkdtemp(path.join(outDir, ".qwen-"));
  try {
    const segments = scenes.map(narrationSegments);
    const items = segments.flatMap((parts, i) => parts.map((part, j) => ({
      id: `${i}-${j}`,
      openingLeadIn: clone && scenes[i].id === openingSceneId && j === 0 && part.language === "ko",
      wavPath: path.resolve(work, `${i}-${j}.wav`),
      text: part.text,
      language: part.language === "en" ? "English" : "Korean",
      align: !scenes[i].speech,
      pauseAfterSec: j + 1 < parts.length ? sentencePauseSec(part.text) : 0,
      measureOnset: scenes[i].codeReveal?.answerCue === part.caption,
    })));
    const resultPath = path.resolve(work, "result.json");
    const jobPath = path.join(work, "job.json");
    if (clone && segments.flat().some(p => needsVowelRelease(p.text, p.language))) {
      if (!config.qwen3UseAligner) throw Error("한국어 복제 음성의 다 말끝에는 강제 정렬이 필요합니다.");
      await fs.access(config.qwen3AlignerModel);
    }
    await fs.writeFile(jobPath, JSON.stringify({
      mode: clone ? "clone" : "custom-voice",
      modelPath: clone ? config.qwen3BaseModel : config.qwen3CustomModel,
      temperature: config.qwen3Temperature,
      alignerModelPath: config.qwen3AlignerModel, useAligner: config.qwen3UseAligner,
      refAudio: profile?.audioPath, refText: profile?.refText, voice,
      instruct: config.qwen3Instruct, items, outputJsonPath: resultPath,
    }), {mode: 0o600});
    await run(config.mlxAudioPython, [path.join(PROJECT_ROOT, "scripts/qwen3_tts_batch.py"), jobPath], {
      env: {...process.env, TMPDIR: process.env.TMPDIR || work, PYTHONDONTWRITEBYTECODE: "1"},
      maxBuffer: 8 * 1024 * 1024,
    });
    const output: {items: Clip[]} = JSON.parse(await fs.readFile(resultPath, "utf8"));
    const tempo = clone ? cloneTempo : 1;
    const filters = ["loudnorm=I=-16:TP=-1.5:LRA=7"];
    if (tempo !== 1) filters.unshift(`atempo=${tempo}`);
    const results = [];
    let clipIndex = 0;
    for (const [i, scene] of scenes.entries()) {
      const warnings: string[] = [];
      const cues: SubtitleCue[] = [];
      const files: string[] = [];
      let cursor = 0;
      for (const [j, segment] of segments[i].entries()) {
        const clip = output.items[clipIndex++];
        if (clone && needsVowelRelease(segment.text, segment.language) && !clip.guard) {
          throw Error(scene.id + "의 문장 말끝 처리 결과가 없습니다.");
        }
        const endSec = cursor + clip.durationSec;
        files.push(`file '${i}-${j}.wav'`);
        if (scene.speech) {
          cues.push({text: segment.caption, startSec: Number((cursor + clip.onsetSec).toFixed(3)), endSec: Number(endSec.toFixed(3))});
        } else {
          cues.push(...groupAlignedWordsToCues(clip.alignedItems, segment.caption, clip.durationSec)
            .map(cue => ({ ...cue, startSec: cursor + cue.startSec, endSec: cursor + cue.endSec })));
        }
        if (clip.alignError) warnings.push(`[${scene.id}] 자막 시간 추정 사용: ${clip.alignError}`);
        cursor = endSec + items[clipIndex - 1].pauseAfterSec;
      }
      const listPath = path.join(work, "files.txt");
      const stagedPath = path.join(work, `${i}.mp3`);
      await fs.writeFile(listPath, files.join("\n") + "\n");
      await run("ffmpeg", ["-loglevel", "error", "-f", "concat", "-safe", "1", "-i", listPath,
        "-af", filters.join(","), "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "2", stagedPath]);
      const durationSec = await probeAudioDurationSec(stagedPath);
      if (tempo !== 1) {
        for (const cue of cues) {
          cue.startSec = Number((cue.startSec / tempo).toFixed(3));
          cue.endSec = Math.min(durationSec, Number((cue.endSec / tempo).toFixed(3)));
        }
      }
      const audioPath = path.join(outDir, `${scene.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.mp3`);
      const digest = clone && segments[i].some(p => needsVowelRelease(p.text, p.language))
        ? await endingDigest(scene, stagedPath) : undefined;
      results.push({result: {audioPath, durationSec, cues, provider, voice, endingDigest: digest}, warnings});
    }
    for (const [i, entry] of results.entries()) {
      await fs.rename(path.join(work, `${i}.mp3`), entry.result.audioPath);
    }
    return results;
  } finally {
    await fs.rm(work, {recursive: true, force: true});
  }
}
