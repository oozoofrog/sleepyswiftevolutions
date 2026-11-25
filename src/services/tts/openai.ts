import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../../config/env";
import { probeAudioDurationSec } from "../../lib/audio-probe";
import { buildFallbackCues } from "../../lib/subtitle";
import type { TtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from "./types";

export class OpenAiTtsProvider implements TtsProvider {
  readonly name = "openai";

  async synthesize(
    text: string,
    outMp3Path: string,
    options?: TtsSynthesizeOptions,
  ): Promise<TtsSynthesizeResult> {
    const config = getConfig();
    if (!config.tts.openaiApiKey) {
      throw new Error("OpenAI TTS를 사용하려면 .env에 OPENAI_API_KEY를 설정해야 합니다.");
    }

    const voice = options?.voice || config.tts.openaiTtsVoice;
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.tts.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: config.tts.openaiTtsModel,
        voice,
        input: text,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS 요청 실패 (${response.status}): ${await response.text()}`);
    }

    await fs.mkdir(path.dirname(outMp3Path), { recursive: true });
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(outMp3Path, buffer);

    const durationSec = await probeAudioDurationSec(outMp3Path);
    const cues = buildFallbackCues(text, durationSec);

    return {
      audioPath: outMp3Path,
      durationSec,
      cues,
      provider: this.name,
      voice,
    };
  }
}
