import fs from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import { getConfig } from "../config/env";
import { getEpisodePaths, REMOTION_ENTRY, type VideoFormat } from "../lib/paths";
import { maxStage, updateEpisodeState, writeJsonAtomic } from "../lib/state";
import { buildSceneTimeline } from "../lib/timeline";
import {
  type AudioManifest,
  AudioManifestSchema,
  type EpisodeScript,
  type RenderInputProps,
} from "../schema/script";
import { loadAndValidateScript } from "./script-generator";

const MACOS_CHROME_FALLBACK = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function loadOptionalManifest(
  proposalId: string,
  format: VideoFormat,
): Promise<AudioManifest | undefined> {
  const paths = getEpisodePaths(proposalId);
  const manifestFile = paths.manifestPath(format);
  try {
    const raw = await fs.readFile(manifestFile, "utf8");
    return AudioManifestSchema.parse(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function resolveBrowserExecutable(): Promise<string | undefined> {
  const config = getConfig();
  if (config.remotion.browserExecutable) {
    return config.remotion.browserExecutable;
  }
  try {
    await ensureBrowser();
    return undefined;
  } catch {
    try {
      await fs.access(MACOS_CHROME_FALLBACK);
      return MACOS_CHROME_FALLBACK;
    } catch {
      throw new Error(
        "Remotion 브라우저를 준비하지 못했습니다. Google Chrome을 설치하거나 .env에 REMOTION_BROWSER_EXECUTABLE 경로를 지정하세요.",
      );
    }
  }
}

/**
 * Writes episodes/SE-XXXX/render-props.json for Remotion Studio preview.
 */
export async function prepareStudioProps(
  proposalId: string,
  format: VideoFormat = "long",
): Promise<{
  script: EpisodeScript;
  propsPath: string;
  audioDir: string;
  compositionId: string;
  hasManifest: boolean;
}> {
  const script = await loadAndValidateScript(proposalId);
  const manifest = await loadOptionalManifest(script.proposalId, format);
  const paths = getEpisodePaths(script.proposalId);

  await fs.mkdir(paths.audioDir, { recursive: true });
  const props: RenderInputProps = {
    script,
    format,
    manifest,
  };
  await writeJsonAtomic(paths.renderPropsJson, props);

  return {
    script,
    propsPath: paths.renderPropsJson,
    audioDir: paths.audioDir,
    compositionId: format === "long" ? "SwiftEvolutionLong" : "SwiftEvolutionShort",
    hasManifest: Boolean(manifest),
  };
}

export interface RenderEpisodeOptions {
  format?: VideoFormat | "both";
  thumbsOnly?: boolean;
  includeThumbs?: boolean;
  concurrency?: number;
  onProgress?: (label: string, progress01: number) => void;
}

export interface RenderedFormatResult {
  format: VideoFormat;
  videoPath?: string;
  thumbPath?: string;
  durationSec: number;
  totalFrames: number;
  usedAudioManifest: boolean;
}

/**
 * Bundles Remotion project once per episode and renders 16:9 / 9:16 videos and thumbnails.
 */
export async function renderEpisode(
  proposalId: string,
  options: RenderEpisodeOptions = {},
): Promise<RenderedFormatResult[]> {
  const config = getConfig();
  const script = await loadAndValidateScript(proposalId);
  const paths = getEpisodePaths(script.proposalId);

  const formats: VideoFormat[] =
    options.format === "both" || !options.format ? ["long", "short"] : [options.format];
  const includeThumbs = options.includeThumbs ?? true;
  const thumbsOnly = options.thumbsOnly ?? false;
  const concurrency = options.concurrency ?? config.remotion.concurrency;

  await fs.mkdir(paths.audioDir, { recursive: true });
  await fs.mkdir(paths.outDir, { recursive: true });

  const browserExecutable = await resolveBrowserExecutable();
  const serveUrl = await bundle({
    entryPoint: REMOTION_ENTRY,
    publicDir: paths.audioDir,
  });

  const results: RenderedFormatResult[] = [];

  try {
    for (const format of formats) {
      const manifest = await loadOptionalManifest(script.proposalId, format);
      const timeline = buildSceneTimeline(script, format, manifest);
      const inputProps: RenderInputProps = {
        script,
        format,
        manifest,
      };

      let renderedVideoPath: string | undefined;
      let renderedThumbPath: string | undefined;

      if (!thumbsOnly) {
        const compId = format === "long" ? "SwiftEvolutionLong" : "SwiftEvolutionShort";
        const composition = await selectComposition({
          serveUrl,
          id: compId,
          inputProps: inputProps as unknown as Record<string, unknown>,
          browserExecutable,
        });

        const outputLocation = paths.videoPath(format);
        let lastReportedPct = -1;
        await renderMedia({
          composition,
          serveUrl,
          codec: "h264",
          outputLocation,
          inputProps: inputProps as unknown as Record<string, unknown>,
          concurrency,
          browserExecutable,
          overwrite: true,
          onProgress: ({ progress }) => {
            const pct = Math.floor(progress * 100);
            if (pct >= lastReportedPct + 10 || pct === 100) {
              lastReportedPct = pct;
              options.onProgress?.(`${script.proposalId} ${format} video`, progress);
            }
          },
        });
        renderedVideoPath = outputLocation;
      }

      if (includeThumbs || thumbsOnly) {
        const thumbCompId = format === "long" ? "ThumbnailLong" : "ThumbnailShort";
        const thumbProps = { script, variant: format };
        const thumbComposition = await selectComposition({
          serveUrl,
          id: thumbCompId,
          inputProps: thumbProps,
          browserExecutable,
        });
        const thumbOutput = paths.thumbPath(format);
        await renderStill({
          composition: thumbComposition,
          serveUrl,
          output: thumbOutput,
          inputProps: thumbProps,
          imageFormat: "png",
          browserExecutable,
          overwrite: true,
        });
        renderedThumbPath = thumbOutput;
      }

      if (renderedVideoPath) {
        await updateEpisodeState(script.proposalId, (prev) => {
          const formatsState = { ...(prev?.formats ?? {}) };
          formatsState[format] = {
            ...(formatsState[format] ?? {}),
            renderedAt: new Date().toISOString(),
            durationSec: timeline.totalDurationSec,
          };
          return {
            id: script.proposalId,
            episodeNumber: script.episodeNumber,
            title: script.proposalTitle,
            proposalState: script.proposalState,
            swiftVersion: script.swiftVersion,
            stage: maxStage(prev?.stage ?? "pending", "rendered"),
            updatedAt: new Date().toISOString(),
            formats: formatsState,
          };
        });
      }

      results.push({
        format,
        videoPath: renderedVideoPath,
        thumbPath: renderedThumbPath,
        durationSec: timeline.totalDurationSec,
        totalFrames: timeline.totalFrames,
        usedAudioManifest: Boolean(manifest),
      });
    }
  } finally {
    // Clean up temporary bundler directory created by @remotion/bundler
    if (path.isAbsolute(serveUrl) && serveUrl.includes("remotion")) {
      await fs.rm(serveUrl, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  return results;
}
