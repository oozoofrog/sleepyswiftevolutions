import { narrationSegments, SCENE_PADDING, sentencePauseSec } from "./pacing";
import type { AudioManifest, EpisodeScript, Scene, SubtitleCue } from "../schema/script";
import { buildFallbackCues } from "./subtitle";

export const DEFAULT_FPS = 30;

/**
 * Pure browser-safe estimation of Korean narration duration (~4.5 spoken chars/sec).
 */
export function estimateNarrationDurationSec(text: string): number {
  const compactLength = text.replace(/\s+/g, "").length;
  const seconds = compactLength / 4.5 + 0.8;
  return Math.max(2.5, Number(seconds.toFixed(2)));
}

/**
 * Resolves the effective Shorts scenes for a script (pure browser-safe).
 */
export function getEffectiveShortsScenes(script: EpisodeScript): Scene[] {
  if (script.shortsScenes && script.shortsScenes.length > 0) {
    return script.shortsScenes;
  }
  return script.scenes
    .filter((scene) => scene.includeInShort !== false)
    .map((scene) => ({
      ...scene,
      speech: scene.shortNarration?.trim() ? scene.shortSpeech : scene.speech,
      narration: scene.shortNarration?.trim() || scene.narration,
    }));
}

export interface ResolvedSceneTiming {
  scene: Scene;
  startSec: number;
  endSec: number;
  startFrame: number;
  durationInFrames: number;
  leadInFrames: number;
  audioFile?: string;
  cues: SubtitleCue[];
}

export interface ResolvedTimeline {
  fps: number;
  totalDurationSec: number;
  totalFrames: number;
  scenes: ResolvedSceneTiming[];
  allCues: SubtitleCue[];
}

/**
 * Resolves exact frame timings and cues from an AudioManifest, or estimates them
 * cleanly for audio-less previews in Remotion Studio.
 */
export function buildSceneTimeline(
  script: EpisodeScript,
  format: "long" | "short",
  manifest?: AudioManifest,
): ResolvedTimeline {
  const fps = manifest?.fps ?? DEFAULT_FPS;
  const rawScenes = format === "long" ? script.scenes : getEffectiveShortsScenes(script);

  if (manifest && manifest.scenes.length > 0) {
    const manifestMap = new Map(manifest.scenes.map((entry) => [entry.sceneId, entry]));
    const resolved: ResolvedSceneTiming[] = [];
    const allCues: SubtitleCue[] = [];
    let cursorFrame = 0;

    for (let i = 0; i < rawScenes.length; i += 1) {
      const scene = rawScenes[i];
      const entry = manifestMap.get(scene.id);
      if (entry) {
        const startFrame = Math.round(entry.startSec * fps);
        const isLast = i === rawScenes.length - 1;
        const durationInFrames = isLast
          ? Math.max(1, manifest.totalFrames - startFrame)
          : Math.max(1, Math.round(entry.totalDurationSec * fps));
        const leadInFrames = Math.round(entry.leadInSec * fps);

        resolved.push({
          scene,
          startSec: entry.startSec,
          endSec: entry.endSec,
          startFrame,
          durationInFrames,
          leadInFrames,
          audioFile: entry.audioFile,
          cues: entry.cues,
        });
        allCues.push(...entry.cues);
        cursorFrame = startFrame + durationInFrames;
      } else {
        const fallbackSec = estimateNarrationDurationSec(scene.narration) + 0.8;
        const durationInFrames = Math.max(1, Math.round(fallbackSec * fps));
        const startSec = cursorFrame / fps;
        const endSec = (cursorFrame + durationInFrames) / fps;
        const cues = buildFallbackCues(scene.narration, fallbackSec).map((c) => ({
          startSec: startSec + c.startSec,
          endSec: startSec + c.endSec,
          text: c.text,
        }));
        resolved.push({
          scene,
          startSec,
          endSec,
          startFrame: cursorFrame,
          durationInFrames,
          leadInFrames: Math.round(0.3 * fps),
          cues,
        });
        allCues.push(...cues);
        cursorFrame += durationInFrames;
      }
    }

    return {
      fps,
      totalDurationSec: manifest.totalDurationSec,
      totalFrames: Math.max(manifest.totalFrames, cursorFrame),
      scenes: resolved,
      allCues,
    };
  }

  // Fallback estimated timeline (for Remotion Studio preview before TTS generation)
  const { leadInSec, tailPadSec } = SCENE_PADDING[format];
  const resolved: ResolvedSceneTiming[] = [];
  const allCues: SubtitleCue[] = [];
  let cursorSec = 0;
  let cursorFrame = 0;

  for (const scene of rawScenes) {
    const segments = narrationSegments(scene);
    const charCounts = segments.map(part => Math.max(1, part.text.replace(/\s+/gu, "").length));
    const totalChars = charCounts.reduce((sum, count) => sum + count, 0);
    const estimate = estimateNarrationDurationSec(segments.map(part => part.text).join(" "));
    let speechSec = 0;
    const localCues = segments.map((segment, index) => {
      const startSec = speechSec;
      const endSec = startSec + estimate * charCounts[index] / totalChars;
      speechSec = endSec + (index + 1 < segments.length ? sentencePauseSec(segment.text) : 0);
      return { startSec, endSec, text: segment.caption };
    });
    const totalSec = Number((leadInSec + speechSec + tailPadSec).toFixed(3));
    const durationInFrames = Math.max(1, Math.round(totalSec * fps));
    const startSec = Number(cursorSec.toFixed(3));
    const endSec = Number((cursorSec + totalSec).toFixed(3));

    const cues = localCues.map((c) => ({
      startSec: Number((startSec + leadInSec + c.startSec).toFixed(3)),
      endSec: Number((startSec + leadInSec + c.endSec).toFixed(3)),
      text: c.text,
    }));

    resolved.push({
      scene,
      startSec,
      endSec,
      startFrame: cursorFrame,
      durationInFrames,
      leadInFrames: Math.round(leadInSec * fps),
      cues,
    });
    allCues.push(...cues);
    cursorSec = endSec;
    cursorFrame += durationInFrames;
  }

  return {
    fps,
    totalDurationSec: Number(cursorSec.toFixed(3)),
    totalFrames: Math.max(1, cursorFrame),
    scenes: resolved,
    allCues,
  };
}
