import fs from "node:fs/promises";
import path from "node:path";
import { convertToMp3, probeAudioDurationSec } from "../../lib/audio-probe";
import { buildFallbackCues } from "../../lib/subtitle";
import type { TtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from "./types";

const SUPPORTED_EXTS = [".mp3", ".wav", ".m4a", ".aiff", ".aac"];

/**
 * Searches episodes/SE-XXXX/audio/custom/ for a user-recorded audio file matching
 * `<format>-<sceneId>.<ext>` or `<sceneId>.<ext>`.
 */
export async function findCustomAudioFile(
  customDir: string,
  format: "long" | "short",
  sceneId: string,
): Promise<string | undefined> {
  const candidates: string[] = [];
  for (const ext of SUPPORTED_EXTS) {
    candidates.push(path.join(customDir, `${format}-${sceneId}${ext}`));
    candidates.push(path.join(customDir, `${sceneId}${ext}`));
  }

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue checking next candidate
    }
  }
  return undefined;
}

export class CustomAudioProvider implements TtsProvider {
  readonly name = "custom";

  async synthesize(
    text: string,
    outMp3Path: string,
    options?: TtsSynthesizeOptions,
  ): Promise<TtsSynthesizeResult> {
    if (!options?.customSourceDir || !options.sceneId || !options.format) {
      throw new Error("custom 오디오 프로바이더는 customSourceDir, format, sceneId가 필요합니다.");
    }

    const found = await findCustomAudioFile(options.customSourceDir, options.format, options.sceneId);
    if (!found) {
      throw new Error(
        `직접 녹음 오디오 파일을 찾을 수 없습니다: ${path.join(
          options.customSourceDir,
          `${options.format}-${options.sceneId}.{mp3,wav,m4a,aiff}`,
        )}`,
      );
    }

    await fs.mkdir(path.dirname(outMp3Path), { recursive: true });
    if (path.extname(found).toLowerCase() === ".mp3") {
      await fs.copyFile(found, outMp3Path);
    } else {
      await convertToMp3(found, outMp3Path);
    }

    const durationSec = await probeAudioDurationSec(outMp3Path);
    const cues = buildFallbackCues(text, durationSec);

    return {
      audioPath: outMp3Path,
      durationSec,
      cues,
      provider: this.name,
      voice: path.basename(found),
    };
  }
}
