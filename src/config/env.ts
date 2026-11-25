import "dotenv/config";
import path from "node:path";
import { PROJECT_ROOT } from "../lib/paths";

export type TtsProviderName =
  | "qwen3-clone"
  | "qwen3-tts"
  | "edge"
  | "macos-say"
  | "openai"
  | "elevenlabs"
  | "custom"
  | "auto";
export type LlmProviderName = "auto" | "openai" | "anthropic" | "gemini";
export type YouTubePrivacy = "private" | "unlisted" | "public";

export interface AppConfig {
  tts: {
    provider: TtsProviderName;
    mlxAudioPython: string;
    qwen3BaseModel: string;
    qwen3CustomModel: string;
    qwen3DesignModel: string;
    qwen3AlignerModel: string;
    qwen3AsrBin: string;
    qwen3Voice: string;
    qwen3Instruct: string;
    qwen3Temperature: number;
    qwen3UseAligner: boolean;
    voiceProfileDir: string;
    voiceProfileAudio?: string;
    voiceProfileText?: string;
    edgeVoice: string;
    edgeRate: string;
    edgeFallbackMacos: boolean;
    macosSayVoice: string;
    macosSayRate: number;
    openaiApiKey?: string;
    openaiTtsModel: string;
    openaiTtsVoice: string;
    elevenlabsApiKey?: string;
    elevenlabsVoiceId?: string;
  };
  llm: {
    provider: LlmProviderName;
    openaiApiKey?: string;
    openaiModel: string;
    anthropicApiKey?: string;
    anthropicModel: string;
    geminiApiKey?: string;
    geminiModel: string;
  };
  remotion: {
    concurrency: number;
    browserExecutable?: string;
  };
  youtube: {
    clientSecretPath: string;
    tokenPath: string;
    defaultPrivacy: YouTubePrivacy;
    defaultPlaylistLong: string;
    defaultPlaylistShort: string;
    oauthPort: number;
  };
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parsePositiveInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function parsePositiveFloat(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function resolveFromRoot(targetPath: string): string {
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(PROJECT_ROOT, targetPath);
}

/**
 * Reads runtime configuration from process.env (.env loaded automatically).
 */
export function getConfig(): AppConfig {
  const ttsProvider = (process.env.TTS_PROVIDER?.trim() || "qwen3-clone") as TtsProviderName;
  const llmProvider = (process.env.LLM_PROVIDER?.trim() || "auto") as LlmProviderName;
  const defaultPrivacyRaw = process.env.YOUTUBE_DEFAULT_PRIVACY?.trim() || "private";
  const defaultPrivacy: YouTubePrivacy =
    defaultPrivacyRaw === "public" || defaultPrivacyRaw === "unlisted" ? defaultPrivacyRaw : "private";

  const voiceProfileAudioRaw = process.env.VOICE_PROFILE_AUDIO?.trim();

  return {
    tts: {
      provider: ttsProvider,
      mlxAudioPython:
        process.env.MLX_AUDIO_PYTHON?.trim() ||
        "/Volumes/eyedisk/AI/Environments/mlx-audio-py312/bin/python",
      qwen3BaseModel:
        process.env.QWEN3_TTS_BASE_MODEL?.trim() ||
        "/Volumes/eyedisk/AI/Models/MLX-Audio/Qwen3-TTS-12Hz-1.7B-Base-8bit",
      qwen3CustomModel:
        process.env.QWEN3_TTS_CUSTOM_MODEL?.trim() ||
        "/Volumes/eyedisk/AI/Models/MLX-Audio/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit",
      qwen3DesignModel:
        process.env.QWEN3_TTS_DESIGN_MODEL?.trim() ||
        "/Volumes/eyedisk/AI/Models/MLX-Audio/Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit",
      qwen3AlignerModel:
        process.env.QWEN3_ALIGNER_MODEL?.trim() ||
        "/Volumes/eyedisk/AI/Models/MLX-Audio/Qwen3-ForcedAligner-0.6B-8bit",
      qwen3AsrBin: process.env.QWEN3_ASR_BIN?.trim() || "/Volumes/eyedisk/AI/bin/qwen3-asr",
      qwen3Voice: process.env.QWEN3_TTS_VOICE?.trim() || "Sohee",
      qwen3Instruct: process.env.QWEN3_TTS_INSTRUCT?.trim() || "",
      qwen3Temperature: parsePositiveFloat(process.env.QWEN3_TTS_TEMPERATURE, 0.7),
      qwen3UseAligner: parseBool(process.env.QWEN3_TTS_USE_ALIGNER, true),
      voiceProfileDir: resolveFromRoot(
        process.env.VOICE_PROFILE_DIR?.trim() || "secrets/voice-profile",
      ),
      voiceProfileAudio: voiceProfileAudioRaw ? resolveFromRoot(voiceProfileAudioRaw) : undefined,
      voiceProfileText: process.env.VOICE_PROFILE_TEXT?.trim() || undefined,
      edgeVoice: process.env.EDGE_TTS_VOICE?.trim() || "ko-KR-HyunsuMultilingualNeural",
      edgeRate: process.env.EDGE_TTS_RATE?.trim() || "+5%",
      edgeFallbackMacos: parseBool(process.env.EDGE_TTS_FALLBACK_MACOS, true),
      macosSayVoice: process.env.MACOS_SAY_VOICE?.trim() || "Yuna",
      macosSayRate: parsePositiveInt(process.env.MACOS_SAY_RATE, 185),
      openaiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
      openaiTtsModel: process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts",
      openaiTtsVoice: process.env.OPENAI_TTS_VOICE?.trim() || "onyx",
      elevenlabsApiKey: process.env.ELEVENLABS_API_KEY?.trim() || undefined,
      elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID?.trim() || undefined,
    },
    llm: {
      provider: llmProvider,
      openaiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
      openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-4.1",
      anthropicApiKey: process.env.ANTHROPIC_API_KEY?.trim() || undefined,
      anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5",
      geminiApiKey: process.env.GEMINI_API_KEY?.trim() || undefined,
      geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-pro",
    },
    remotion: {
      concurrency: parsePositiveInt(process.env.REMOTION_CONCURRENCY, 4),
      browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE?.trim() || undefined,
    },
    youtube: {
      clientSecretPath: resolveFromRoot(
        process.env.YOUTUBE_CLIENT_SECRET_PATH?.trim() || "secrets/youtube-client-secret.json",
      ),
      tokenPath: resolveFromRoot(process.env.YOUTUBE_TOKEN_PATH?.trim() || "secrets/youtube-token.json"),
      defaultPrivacy,
      defaultPlaylistLong:
        process.env.YOUTUBE_DEFAULT_PLAYLIST_LONG?.trim() || "Swift Evolution 처음부터 끝까지",
      defaultPlaylistShort: process.env.YOUTUBE_DEFAULT_PLAYLIST_SHORT?.trim() || "Swift Evolution Shorts",
      oauthPort: parsePositiveInt(process.env.YOUTUBE_OAUTH_PORT, 43821),
    },
  };
}
