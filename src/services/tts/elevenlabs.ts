import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../../config/env";
import { probeAudioDurationSec } from "../../lib/audio-probe";
import { buildFallbackCues } from "../../lib/subtitle";
import type { TtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from "./types";

export class ElevenLabsTtsProvider implements TtsProvider {
  readonly name = "elevenlabs";

  async synthesize(
    text: string,
    outMp3Path: string,
    options?: TtsSynthesizeOptions,
  ): Promise<TtsSynthesizeResult> {
    const config = getConfig();
    if (!config.tts.elevenlabsApiKey) {
      throw new Error("ElevenLabs TTS를 사용하려면 .env에 ELEVENLABS_API_KEY를 설정해야 합니다.");
    }
    const voiceId = options?.voice || config.tts.elevenlabsVoiceId;
    if (!voiceId) {
      throw new Error("ElevenLabs TTS를 사용하려면 ELEVENLABS_VOICE_ID 또는 --voice를 지정해야 합니다.");
    }

    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": config.tts.elevenlabsApiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS 요청 실패 (${response.status}): ${await response.text()}`);
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
      voice: voiceId,
    };
  }
}
