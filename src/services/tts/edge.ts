import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getConfig } from "../../config/env";
import { probeAudioDurationSec } from "../../lib/audio-probe";
import { buildFallbackCues, parseSrtOrVtt } from "../../lib/subtitle";
import type { TtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from "./types";

const execFileAsync = promisify(execFile);

async function resolveEdgeBinary(): Promise<{ cmd: string; prefixArgs: string[] }> {
  try {
    await execFileAsync("which", ["edge-tts"]);
    return { cmd: "edge-tts", prefixArgs: [] };
  } catch {
    return { cmd: "uvx", prefixArgs: ["edge-tts"] };
  }
}

export class EdgeTtsProvider implements TtsProvider {
  readonly name = "edge";

  async synthesize(
    text: string,
    outMp3Path: string,
    options?: TtsSynthesizeOptions,
  ): Promise<TtsSynthesizeResult> {
    const config = getConfig();
    const voice = options?.voice || config.tts.edgeVoice;
    const rate = options?.rate || config.tts.edgeRate;

    await fs.mkdir(path.dirname(outMp3Path), { recursive: true });
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "se-edge-tts-"));
    const tmpTextPath = path.join(tmpDir, "narration.txt");
    const tmpSubPath = path.join(tmpDir, "subtitles.srt");

    try {
      await fs.writeFile(tmpTextPath, text, "utf8");
      const { cmd, prefixArgs } = await resolveEdgeBinary();

      // Use --rate=<value> with '=' so negative rates like -5% aren't misread as flags
      await execFileAsync(
        cmd,
        [
          ...prefixArgs,
          "-f",
          tmpTextPath,
          "-v",
          voice,
          `--rate=${rate}`,
          "--write-media",
          outMp3Path,
          "--write-subtitles",
          tmpSubPath,
          "--no-progress",
        ],
        { timeout: 60_000 },
      );

      const durationSec = await probeAudioDurationSec(outMp3Path);
      let cues = [] as ReturnType<typeof parseSrtOrVtt>;
      try {
        const subRaw = await fs.readFile(tmpSubPath, "utf8");
        cues = parseSrtOrVtt(subRaw);
      } catch {
        cues = [];
      }

      if (cues.length === 0) {
        cues = buildFallbackCues(text, durationSec);
      }

      return {
        audioPath: outMp3Path,
        durationSec,
        cues,
        provider: this.name,
        voice,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
