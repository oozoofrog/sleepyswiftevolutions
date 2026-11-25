import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getConfig } from "../../config/env";
import { convertToMp3, probeAudioDurationSec } from "../../lib/audio-probe";
import { buildFallbackCues } from "../../lib/subtitle";
import type { TtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from "./types";

const execFileAsync = promisify(execFile);

export class MacOsSayProvider implements TtsProvider {
  readonly name = "macos-say";

  async synthesize(
    text: string,
    outMp3Path: string,
    options?: TtsSynthesizeOptions,
  ): Promise<TtsSynthesizeResult> {
    const config = getConfig();
    const voice = options?.voice || config.tts.macosSayVoice;
    const parsedRate = options?.rate ? Number.parseInt(options.rate.replace(/[^\d]/g, ""), 10) : NaN;
    const rate = Number.isFinite(parsedRate) && parsedRate > 50 ? parsedRate : config.tts.macosSayRate;

    await fs.mkdir(path.dirname(outMp3Path), { recursive: true });
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "se-say-tts-"));
    const tmpTextPath = path.join(tmpDir, "narration.txt");
    const tmpAiffPath = path.join(tmpDir, "speech.aiff");

    try {
      await fs.writeFile(tmpTextPath, text, "utf8");
      await execFileAsync("/usr/bin/say", ["-v", voice, "-r", String(rate), "-f", tmpTextPath, "-o", tmpAiffPath]);
      await convertToMp3(tmpAiffPath, outMp3Path);

      const durationSec = await probeAudioDurationSec(outMp3Path);
      const cues = buildFallbackCues(text, durationSec);

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
