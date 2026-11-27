import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import type { youtube_v3 } from "googleapis";
import { getConfig, type YouTubePrivacy } from "../../config/env";
import { getEpisodePaths, type VideoFormat } from "../../lib/paths";
import { loadWorkspaceState, maxStage, saveWorkspaceState, updateEpisodeState } from "../../lib/state";
import { formatYouTubeChapters } from "../../lib/subtitle";
import { getEffectiveShortsScenes } from "../../lib/timeline";
import type { UploadRecord } from "../../schema/evolution";
import { type AudioManifest, AudioManifestSchema, type EpisodeScript } from "../../schema/script";
import { loadAndValidateScript } from "../script-generator";
import { getAuthorizedYouTubeClient } from "./auth";

import { checkEndings, checkRenderedFile } from "../ending-check";

export interface UploadEpisodeOptions {
  format?: VideoFormat | "both";
  privacy?: YouTubePrivacy;
  publishAt?: string;
  dryRun?: boolean;
  force?: boolean;
  captions?: boolean;
  playlist?: boolean;
}

export interface PreparedUploadPayload {
  format: VideoFormat;
  script: EpisodeScript;
  videoPath: string;
  videoExists: boolean;
  videoSizeBytes?: number;
  thumbPath: string;
  thumbExists: boolean;
  subtitlesPath: string;
  subtitlesExists: boolean;
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  defaultLanguage: string;
  playlistNames: string[];
  privacyStatus: YouTubePrivacy;
  publishAt?: string;
}

export interface UploadResult {
  format: VideoFormat;
  dryRun: boolean;
  payload: PreparedUploadPayload;
  videoId?: string;
  url?: string;
  warnings: string[];
}

async function fileExistsAndSize(filePath: string): Promise<{ exists: boolean; sizeBytes?: number }> {
  try {
    const stat = await fs.stat(filePath);
    return { exists: true, sizeBytes: stat.size };
  } catch {
    return { exists: false };
  }
}

async function loadOptionalManifest(
  proposalId: string,
  format: VideoFormat,
): Promise<AudioManifest | undefined> {
  const paths = getEpisodePaths(proposalId);
  try {
    const raw = await fs.readFile(paths.manifestPath(format), "utf8");
    return AudioManifestSchema.parse(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

function buildEnrichedDescription(
  script: EpisodeScript,
  format: VideoFormat,
  manifest?: AudioManifest,
): string {
  const meta = script.youtube[format];
  let description = meta.description.trim();

  if (format === "long") {
    const chapters = formatYouTubeChapters(script.scenes, manifest);
    if (!description.includes("00:00")) {
      description = `${description}\n\n⏱️ 챕터\n${chapters}`;
    }
  } else {
    // Ensure Shorts discoverability tag is present
    if (!/#shorts/i.test(description)) {
      description = `${description}\n\n#Shorts`;
    }
    const shortScenes = getEffectiveShortsScenes(script);
    if (shortScenes.length > 0 && !description.includes(script.proposalId)) {
      description = `${description}\n\n${script.proposalId}: ${script.proposalTitle}`;
    }
  }

  if (!description.includes(script.proposalUrl)) {
    description = `${description}\n\n📄 원문 Proposal: ${script.proposalUrl}`;
  }

  return description;
}

/**
 * Prepares exact YouTube upload metadata and validates local file presence.
 */
export async function buildUploadPayload(
  proposalId: string,
  format: VideoFormat,
  options: UploadEpisodeOptions = {},
): Promise<PreparedUploadPayload> {
  const config = getConfig();
  const script = await loadAndValidateScript(proposalId);
  const paths = getEpisodePaths(script.proposalId);
  const manifest = await loadOptionalManifest(script.proposalId, format);

  const videoPath = paths.videoPath(format);
  const thumbPath = paths.thumbPath(format);
  const subtitlesPath = paths.subtitlesPath(format);

  const [videoInfo, thumbInfo, subInfo] = await Promise.all([
    fileExistsAndSize(videoPath),
    fileExistsAndSize(thumbPath),
    fileExistsAndSize(subtitlesPath),
  ]);

  if (videoInfo.exists && await checkEndings(script, format, manifest)) {
    await checkRenderedFile(videoPath, manifest!, false);
  }
  const meta = script.youtube[format];
  let title = meta.title.trim();
  if (format === "short" && !/#shorts/i.test(title) && title.length <= 92) {
    title = `${title} #Shorts`;
  }

  let publishAt: string | undefined = options.publishAt?.trim() || undefined;
  let privacyStatus: YouTubePrivacy = options.privacy ?? config.youtube.defaultPrivacy;

  if (publishAt) {
    const parsedDate = new Date(publishAt);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`유효하지 않은 --publish-at ISO 날짜 형식입니다: "${publishAt}"`);
    }
    publishAt = parsedDate.toISOString();
    // YouTube Data API requires privacyStatus='private' when scheduling publishAt
    privacyStatus = "private";
  }

  return {
    format,
    script,
    videoPath,
    videoExists: videoInfo.exists,
    videoSizeBytes: videoInfo.sizeBytes,
    thumbPath,
    thumbExists: thumbInfo.exists,
    subtitlesPath,
    subtitlesExists: subInfo.exists,
    title,
    description: buildEnrichedDescription(script, format, manifest),
    tags: meta.tags,
    categoryId: meta.categoryId || "28",
    defaultLanguage: meta.defaultLanguage || "ko",
    playlistNames: meta.playlistNames,
    privacyStatus,
    publishAt,
  };
}

async function resolveOrCreatePlaylistId(
  youtube: youtube_v3.Youtube,
  title: string,
  privacyStatus: YouTubePrivacy,
): Promise<string> {
  const state = await loadWorkspaceState();
  const cached = state.playlistCache[title];
  if (cached) {
    return cached;
  }

  let pageToken: string | undefined;
  do {
    const listRes = await youtube.playlists.list({
      part: ["snippet"],
      mine: true,
      maxResults: 50,
      pageToken,
    });
    const matched = listRes.data.items?.find((item) => item.snippet?.title === title);
    if (matched?.id) {
      state.playlistCache[title] = matched.id;
      await saveWorkspaceState(state);
      return matched.id;
    }
    pageToken = listRes.data.nextPageToken ?? undefined;
  } while (pageToken);

  const createRes = await youtube.playlists.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description: `${title} - Swift Evolution 한국어 해설 시리즈`,
        defaultLanguage: "ko",
      },
      status: {
        privacyStatus: privacyStatus === "public" ? "public" : "unlisted",
      },
    },
  });

  const newId = createRes.data.id;
  if (!newId) {
    throw new Error(`재생목록을 생성했지만 ID를 받지 못했습니다: ${title}`);
  }
  state.playlistCache[title] = newId;
  await saveWorkspaceState(state);
  return newId;
}

/**
 * Uploads rendered 16:9 / 9:16 videos (plus thumbnail, SRT captions, and playlists) to YouTube.
 */
export async function uploadEpisodeToYouTube(
  proposalId: string,
  options: UploadEpisodeOptions = {},
): Promise<UploadResult[]> {
  const formats: VideoFormat[] =
    options.format === "both" || !options.format ? ["long", "short"] : [options.format];
  const dryRun = Boolean(options.dryRun);
  const uploadCaptions = options.captions ?? true;
  const addToPlaylists = options.playlist ?? true;

  const payloads: PreparedUploadPayload[] = [];
  const state = await loadWorkspaceState();

  for (const format of formats) {
    const payload = await buildUploadPayload(proposalId, format, options);
    const existingUpload = state.episodes[payload.script.proposalId]?.formats[format]?.upload;
    if (existingUpload && !options.force && !dryRun) {
      throw new Error(
        `${payload.script.proposalId} (${format})는 이미 업로드되었습니다 (${existingUpload.url}). 다시 올리려면 --force를 지정하세요.`,
      );
    }
    if (!dryRun && !payload.videoExists) {
      throw new Error(
        `렌더링된 영상 파일을 찾을 수 없습니다: ${payload.videoPath}\n먼저 'pnpm evo render ${payload.script.proposalId} --format ${format}'를 실행하세요.`,
      );
    }
    payloads.push(payload);
  }

  if (dryRun) {
    return payloads.map((payload) => ({
      format: payload.format,
      dryRun: true,
      payload,
      warnings: payload.videoExists
        ? []
        : [`아직 영상이 렌더링되지 않았습니다 (${payload.videoPath}).`],
    }));
  }

  const youtube = await getAuthorizedYouTubeClient();
  const results: UploadResult[] = [];

  for (const payload of payloads) {
    const warnings: string[] = [];

    const insertRes = await youtube.videos.insert({
      part: ["snippet", "status"],
      notifySubscribers: true,
      requestBody: {
        snippet: {
          title: payload.title,
          description: payload.description,
          tags: payload.tags,
          categoryId: payload.categoryId,
          defaultLanguage: payload.defaultLanguage,
          defaultAudioLanguage: payload.defaultLanguage,
        },
        status: {
          privacyStatus: payload.privacyStatus,
          ...(payload.publishAt ? { publishAt: payload.publishAt } : {}),
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: "video/mp4",
        body: createReadStream(payload.videoPath),
      },
    });

    const videoId = insertRes.data.id;
    if (!videoId) {
      throw new Error(`YouTube 업로드 응답에 videoId가 없습니다 (${payload.script.proposalId} ${payload.format}).`);
    }
    const url =
      payload.format === "short"
        ? `https://www.youtube.com/shorts/${videoId}`
        : `https://youtu.be/${videoId}`;

    // Custom thumbnail (only for long or when file exists; YouTube Shorts thumbnails via API may vary by channel verification)
    let thumbnailUploaded = false;
    if (payload.thumbExists) {
      try {
        await youtube.thumbnails.set({
          videoId,
          media: {
            mimeType: "image/png",
            body: createReadStream(payload.thumbPath),
          },
        });
        thumbnailUploaded = true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        warnings.push(`썸네일 업로드 건너뜀 (${msg}). 채널 전화번호 인증 여부를 확인하세요.`);
      }
    }

    // Upload each available language as a selectable subtitle track.
    let captionsUploaded = false;
    if (uploadCaptions && payload.subtitlesExists) {
      for (const [language, name] of [
        ["ko", "한국어"], ["en", "English"], ["ja", "日本語"], ["zh-Hans", "中文（简体）"],
      ]) {
        const file = language === "ko" ? payload.subtitlesPath
          : payload.subtitlesPath.replace(/\.srt$/, `.${language}.srt`);
        if (!(await fileExistsAndSize(file)).exists) continue;
        try {
          await youtube.captions.insert({
            part: ["snippet"],
            requestBody: { snippet: { videoId, language, name, isDraft: false } },
            media: { mimeType: "application/x-subrip", body: createReadStream(file) },
          });
          captionsUploaded = true;
        } catch (err) {
          warnings.push(`${language} 자막 업로드 실패: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    // Playlists
    const addedPlaylists: string[] = [];
    if (addToPlaylists && payload.playlistNames.length > 0) {
      for (const playlistTitle of payload.playlistNames) {
        try {
          const playlistId = await resolveOrCreatePlaylistId(
            youtube,
            playlistTitle,
            payload.privacyStatus,
          );
          await youtube.playlistItems.insert({
            part: ["snippet"],
            requestBody: {
              snippet: {
                playlistId,
                resourceId: {
                  kind: "youtube#video",
                  videoId,
                },
              },
            },
          });
          addedPlaylists.push(playlistTitle);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          warnings.push(`재생목록 "${playlistTitle}" 추가 실패 (${msg}).`);
        }
      }
    }

    const record: UploadRecord = {
      videoId,
      url,
      uploadedAt: new Date().toISOString(),
      privacyStatus: payload.privacyStatus,
      publishAt: payload.publishAt,
      title: payload.title,
      playlists: addedPlaylists,
      captionsUploaded,
      thumbnailUploaded,
    };

    await updateEpisodeState(payload.script.proposalId, (prev) => {
      const formatsState = { ...(prev?.formats ?? {}) };
      formatsState[payload.format] = {
        ...(formatsState[payload.format] ?? {}),
        upload: record,
      };
      return {
        id: payload.script.proposalId,
        episodeNumber: payload.script.episodeNumber,
        title: payload.script.proposalTitle,
        proposalState: payload.script.proposalState,
        swiftVersion: payload.script.swiftVersion,
        stage: maxStage(prev?.stage ?? "pending", "uploaded"),
        updatedAt: new Date().toISOString(),
        formats: formatsState,
      };
    });

    results.push({
      format: payload.format,
      dryRun: false,
      payload,
      videoId,
      url,
      warnings,
    });
  }

  return results;
}
