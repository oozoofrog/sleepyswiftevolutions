import { SCENE_PADDING } from "../../lib/pacing";
import fs from "node:fs/promises";
import path from "node:path";
import { getConfig, type TtsProviderName } from "../../config/env";
import { getEpisodePaths, type VideoFormat } from "../../lib/paths";
import { maxStage, updateEpisodeState, writeJsonAtomic } from "../../lib/state";
import { buildFallbackCues, formatSrt } from "../../lib/subtitle";
import {
  type AudioManifest,
  AudioManifestSchema,
  type Scene,
  type SceneAudioEntry,
  type SubtitleCue,
} from "../../schema/script";
import { getEffectiveShortsScenes, loadAndValidateScript } from "../script-generator";
import { CustomAudioProvider, findCustomAudioFile } from "./custom";
import { EdgeTtsProvider } from "./edge";
import { ElevenLabsTtsProvider } from "./elevenlabs";
import { MacOsSayProvider } from "./macos-say";
import { OpenAiTtsProvider } from "./openai";
import { synthesizeQwenScenes } from "./qwen";
import type { TtsProvider, TtsSynthesizeResult } from "./types";

const FPS = 30;

function createProvider(name: TtsProviderName): TtsProvider {
  switch (name) {
    case "edge":
      return new EdgeTtsProvider();
    case "macos-say":
      return new MacOsSayProvider();
    case "openai":
      return new OpenAiTtsProvider();
    case "elevenlabs":
      return new ElevenLabsTtsProvider();
    case "custom":
      return new CustomAudioProvider();
    case "auto":
      return new EdgeTtsProvider();
    default:
      throw new Error(`지원하지 않는 TTS 제공자입니다: ${name}`);
  }
}

export interface VoiceSynthesisOptions {
  format?: VideoFormat | "both";
  provider?: TtsProviderName;
  voice?: string;
  rate?: string;
  fallback?: boolean;
}

export interface VoiceSynthesisSummary {
  format: VideoFormat;
  manifest: AudioManifest;
  subtitlesPath: string;
  warnings: string[];
}

async function synthesizeSceneWithFallback(
  scene: Scene,
  format: VideoFormat,
  outMp3Path: string,
  customDir: string,
  requestedProvider: TtsProviderName,
  options: VoiceSynthesisOptions,
): Promise<{ result: TtsSynthesizeResult; warnings: string[] }> {
  const warnings: string[] = [];
  const config = getConfig();
  const allowFallback = options.fallback ?? config.tts.edgeFallbackMacos;

  // Prefer user-recorded audio when provider is 'auto' or 'custom' and file exists
  if (requestedProvider === "auto" || requestedProvider === "custom") {
    const customFile = await findCustomAudioFile(customDir, format, scene.id);
    if (customFile) {
      const customProvider = new CustomAudioProvider();
      const result = await customProvider.synthesize(scene.narration, outMp3Path, {
        customSourceDir: customDir,
        format,
        sceneId: scene.id,
      });
      return { result, warnings };
    }
    if (requestedProvider === "custom") {
      throw new Error(
        `${scene.id}에 대한 직접 녹음 파일이 없습니다. ${customDir}/${format}-${scene.id}.{mp3,wav,m4a,aiff} 위치에 파일을 넣어주세요.`,
      );
    }
  }

  const spoken = scene.speech?.map((segment) => segment.text).join(" ") ?? scene.narration;
  const primary = createProvider(requestedProvider);
  try {
    const result = await primary.synthesize(spoken, outMp3Path, {
      voice: options.voice,
      rate: options.rate,
      customSourceDir: customDir,
      format,
      sceneId: scene.id,
    });
    if (scene.speech) result.cues = buildFallbackCues(scene.narration, result.durationSec);
    return { result, warnings };
  } catch (err) {
    if ((requestedProvider === "edge" || requestedProvider === "auto") && allowFallback) {
      const message = err instanceof Error ? err.message : String(err);
      warnings.push(`[${format}/${scene.id}] Edge TTS 실패 -> macOS say 폴백 사용 (${message})`);
      const fallbackProvider = new MacOsSayProvider();
      const result = await fallbackProvider.synthesize(spoken, outMp3Path, {
        rate: options.rate,
      });
      if (scene.speech) result.cues = buildFallbackCues(scene.narration, result.durationSec);
      return { result, warnings };
    }
    throw err;
  }
}

/**
 * Generates per-scene audio MP3s, subtitles.srt, and manifest.json for long (16:9) and/or short (9:16).
 */
export async function synthesizeEpisodeAudio(
  proposalId: string,
  options: VoiceSynthesisOptions = {},
): Promise<VoiceSynthesisSummary[]> {
  const config = getConfig();
  const requestedProvider = options.provider ?? config.tts.provider;
  const script = await loadAndValidateScript(proposalId);
  const paths = getEpisodePaths(script.proposalId);

  const formats: VideoFormat[] =
    options.format === "both" || !options.format ? ["long", "short"] : [options.format];

  const summaries: VoiceSynthesisSummary[] = [];

  for (const format of formats) {
    const scenes = format === "long" ? script.scenes : getEffectiveShortsScenes(script);
    const { leadInSec, tailPadSec } = SCENE_PADDING[format];

    const audioEntries: SceneAudioEntry[] = [];
    const allCues: SubtitleCue[] = [];
    const warnings: string[] = [];

    let cursorSec = 0;
    let lastProvider = String(requestedProvider);
    let lastVoice = options.voice || "";

    await fs.mkdir(paths.formatAudioDir(format), { recursive: true });

    const qwenResults = requestedProvider === "qwen3-clone" || requestedProvider === "qwen3-tts"
      ? await synthesizeQwenScenes(scenes, paths.formatAudioDir(format), requestedProvider, options.voice)
      : undefined;

    for (const [sceneIndex, scene] of scenes.entries()) {
      const safeFile = `${scene.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.mp3`;
      const absMp3Path = path.join(paths.formatAudioDir(format), safeFile);
      const relMp3Path = `${format}/${safeFile}`;

      const { result, warnings: sceneWarnings } = qwenResults?.[sceneIndex] ?? await synthesizeSceneWithFallback(
        scene,
        format,
        absMp3Path,
        paths.audioCustomDir,
        requestedProvider,
        options,
      );
      warnings.push(...sceneWarnings);
      lastProvider = result.provider;
      lastVoice = result.voice;

      const totalSceneDurationSec = Number((leadInSec + result.durationSec + tailPadSec).toFixed(3));
      const sceneStartSec = Number(cursorSec.toFixed(3));
      const sceneEndSec = Number((cursorSec + totalSceneDurationSec).toFixed(3));

      const shiftedCues: SubtitleCue[] = result.cues.map((cue) => ({
        startSec: Number((sceneStartSec + leadInSec + cue.startSec).toFixed(3)),
        endSec: Number((sceneStartSec + leadInSec + cue.endSec).toFixed(3)),
        text: cue.text,
      }));
      allCues.push(...shiftedCues);

      audioEntries.push({
        sceneId: scene.id,
        audioFile: relMp3Path,
        durationSec: result.durationSec,
        leadInSec,
        tailPadSec,
        totalDurationSec: totalSceneDurationSec,
        startSec: sceneStartSec,
        endSec: sceneEndSec,
        cues: shiftedCues,
      });

      cursorSec = sceneEndSec;
    }

    const totalDurationSec = Number(cursorSec.toFixed(3));
    const totalFrames = Math.max(1, Math.ceil(totalDurationSec * FPS));

    if (format === "short" && totalDurationSec > 59.5) {
      warnings.push(
        `경고: Shorts 전체 길이(${totalDurationSec.toFixed(1)}초)가 59.5초를 초과했습니다. YouTube Shorts로 분류되도록 대본(shortsScenes)을 조금 더 짧게 줄이는 것을 권장합니다.`,
      );
    }

    const manifest = AudioManifestSchema.parse({
      proposalId: script.proposalId,
      format,
      provider: lastProvider,
      voice: lastVoice,
      fps: FPS,
      totalDurationSec,
      totalFrames,
      generatedAt: new Date().toISOString(),
      scenes: audioEntries,
    });

    await writeJsonAtomic(paths.manifestPath(format), manifest);
    const srtContent = formatSrt(allCues);
    await fs.writeFile(paths.subtitlesPath(format), srtContent, "utf8");

    await updateEpisodeState(script.proposalId, (prev) => {
      const formatsState = { ...(prev?.formats ?? {}) };
      formatsState[format] = {
        ...(formatsState[format] ?? {}),
        voicedAt: new Date().toISOString(),
        durationSec: totalDurationSec,
      };
      return {
        id: script.proposalId,
        episodeNumber: script.episodeNumber,
        title: script.proposalTitle,
        proposalState: script.proposalState,
        swiftVersion: script.swiftVersion,
        stage: maxStage(prev?.stage ?? "pending", "voiced"),
        updatedAt: new Date().toISOString(),
        formats: formatsState,
      };
    });

    summaries.push({
      format,
      manifest,
      subtitlesPath: paths.subtitlesPath(format),
      warnings,
    });
  }

  return summaries;
}
