import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { youtube_v3 } from "googleapis";
import { getAuthorizedYouTubeClient } from "../../src/services/youtube/auth";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, "out");
const RECEIPT_PATH = path.join(OUT, "upload-receipt.json");
const PLAYLIST_TITLE = "유니코드 연대기";

const LANGUAGES: Array<[code: string, name: string]> = [
  ["ko", "한국어"],
  ["en", "English"],
  ["ja", "日本語"],
  ["zh-Hans", "中文（简体）"],
];

interface FormatReceipt {
  videoId: string;
  url: string;
  title: string;
  privacyStatus: string;
  thumbnailUploaded?: boolean;
  captions?: string[];
  playlistId?: string;
  uploadedAt?: string;
  processingStatus?: string;
}

interface UploadReceipt {
  channelId: string;
  playlistId?: string;
  long?: FormatReceipt;
  short?: FormatReceipt;
}

const LONG_TITLE = "유니코드 1.0 연대기 — 한 획에 붙은 세 번호";
const SHORT_TITLE = "유니코드 1.0 연대기 — 한 획에 붙은 세 번호 #Shorts";

const SOURCES_AND_CREDITS = [
  "자료와 출처",
  "원작 글 · https://oozoofrog.dev/blog/chronology_unicode/",
  "유니코드 컨소시엄 연대기 · https://www.unicode.org/history/versionone.html",
  "조 베커 제안서 (Unicode 88) · https://www.unicode.org/history/Unicode88.pdf",
  "유니코드 1.0 제1·2권 · https://www.unicode.org/versions/Unicode1.0.0/",
  "캐런 스미스요시무라 RLIN CJK 논문 (1993) · https://scholarsarchive.byu.edu/jeal/vol1993/iss101/12/",
  "리 콜린스 등 베트남 따이어 제안서 L2/26-068 (2026) · https://www.unicode.org/L2/L2026/26068-v-source-character-u2b8a0.pdf",
  "유니코드 18.0 및 통계 · https://www.unicode.org/versions/Unicode18.0.0/ · https://www.unicode.org/versions/stats/charcountv18_0.html",
  "지원 문자 목록 및 CLDR 49 · https://www.unicode.org/standard/supported.html · https://cldr.unicode.org/index/downloads/cldr-49",
  "토토 문자 제안서 L2/19-330 · https://www.unicode.org/L2/L2019/19330-toto-script.pdf",
  "",
  "인물 기록 및 사진 출처",
  "Joseph D. Becker · Mark Davis 인물 사진: Unicode Consortium Historical Photo Album (https://www.unicode.org/history/photoalbum/ · 촬영 연도 미상)",
  "Nelson Ng: Palo Alto Museum · Akira Miyazawa: 일본 국립정보학연구소(NII) · 이춘택: 공주대학교 · 김경석: 부산대학교",
].join("\n");

function buildLongDescription(): string {
  return [
    "한글 자모 ㄱ(U+3131)과 한자 一(U+4E00)을 따라 1986년 제록스의 한·중·일 문자표 대조부터 1988년 조 베커의 제안서, 1990년 서울 회의, 1991–1992년 유니코드 1.0 두 권의 출판과 참여자들의 이후 기록, 그리고 172,808자를 담은 유니코드 18.0 쿠키까지 한 편에 담았습니다.",
    "",
    "⏱️ 챕터",
    "00:00 1988년 8월 29일 · 조 베커의 제안",
    "00:25 1986–1987 · 제록스의 한자 대조표",
    "00:51 1987 · 애플의 파일 교환 프로그램",
    "01:16 1988 · 도서관의 한·중·일 문자 자료",
    "01:34 1988 · 공통 번호의 제안",
    "02:04 1989 · 두 개의 푸를 청",
    "02:33 1990 · 한국 대표단의 제안",
    "02:54 1991 · 초판이 두 권으로 나온 이유",
    "03:40 1992 · 원래 문자표로 되돌리기",
    "04:46 그 뒤의 사람들",
    "05:48 2026 · 리 콜린스의 제안서",
    "06:11 쿠키 · 오늘의 유니코드",
    "",
    SOURCES_AND_CREDITS,
  ].join("\n");
}

function buildShortDescription(longUrl: string): string {
  return [
    "1988년 조 베커의 유니코드 제안부터 세 나라 문자표에서 한자 一(U+4E00)을 되돌리는 과정, 2026년 제안서, 그리고 172,808자의 유니코드 18.0 쿠키까지 요약했습니다.",
    "",
    `전체 본편 · ${longUrl}`,
    "",
    "#Shorts",
    "",
    SOURCES_AND_CREDITS,
  ].join("\n");
}

async function loadReceipt(): Promise<UploadReceipt> {
  try {
    return JSON.parse(await fs.readFile(RECEIPT_PATH, "utf8")) as UploadReceipt;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { channelId: "UCCtGyB0lbnsT0ES0Yuwhwjg" };
    }
    throw err;
  }
}

async function saveReceipt(receipt: UploadReceipt): Promise<void> {
  const tmp = `${RECEIPT_PATH}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  await fs.rename(tmp, RECEIPT_PATH);
}

async function fetchChannelUploads(youtube: youtube_v3.Youtube): Promise<Map<string, { videoId: string; privacyStatus?: string }>> {
  const ch = await youtube.channels.list({ part: ["contentDetails"], mine: true });
  const uploadsId = ch.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  const byTitle = new Map<string, { videoId: string; privacyStatus?: string }>();
  if (!uploadsId) return byTitle;

  let pageToken: string | undefined;
  do {
    const res = await youtube.playlistItems.list({
      part: ["snippet", "status"],
      playlistId: uploadsId,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items ?? []) {
      const title = item.snippet?.title;
      const videoId = item.snippet?.resourceId?.videoId;
      if (title && videoId && !byTitle.has(title)) {
        byTitle.set(title, { videoId, privacyStatus: item.status?.privacyStatus ?? undefined });
      }
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  return byTitle;
}

async function resolveOrCreatePlaylist(youtube: youtube_v3.Youtube, receipt: UploadReceipt): Promise<string> {
  if (receipt.playlistId) return receipt.playlistId;

  let pageToken: string | undefined;
  do {
    const res = await youtube.playlists.list({
      part: ["snippet"],
      mine: true,
      maxResults: 50,
      pageToken,
    });
    const match = res.data.items?.find(item => item.snippet?.title === PLAYLIST_TITLE);
    if (match?.id) {
      receipt.playlistId = match.id;
      await saveReceipt(receipt);
      return match.id;
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  const created = await youtube.playlists.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: PLAYLIST_TITLE,
        description: "유니코드 1.0 연대기와 문자 인코딩의 역사를 다룬 영상 모음",
        defaultLanguage: "ko",
      },
      status: { privacyStatus: "public" },
    },
  });
  const id = created.data.id;
  if (!id) throw new Error(`재생목록 생성 후 ID를 받지 못했습니다: ${PLAYLIST_TITLE}`);
  receipt.playlistId = id;
  await saveReceipt(receipt);
  return id;
}

async function ensurePlaylistItem(youtube: youtube_v3.Youtube, playlistId: string, videoId: string): Promise<void> {
  let pageToken: string | undefined;
  do {
    const res = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId,
      maxResults: 50,
      pageToken,
    });
    if (res.data.items?.some(item => item.snippet?.resourceId?.videoId === videoId)) {
      return;
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  await youtube.playlistItems.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: { kind: "youtube#video", videoId },
      },
    },
  });
}

async function ensureCaptions(
  youtube: youtube_v3.Youtube,
  videoId: string,
  subDir: string,
): Promise<string[]> {
  const existing = await youtube.captions.list({ part: ["snippet"], videoId });
  const present = new Set((existing.data.items ?? []).map(item => item.snippet?.language).filter(Boolean) as string[]);

  for (const [language, name] of LANGUAGES) {
    if (present.has(language)) continue;
    const srtPath = path.join(subDir, `${language}.srt`);
    await fs.access(srtPath);
    await youtube.captions.insert({
      part: ["snippet"],
      requestBody: { snippet: { videoId, language, name, isDraft: false } },
      media: { mimeType: "application/x-subrip", body: createReadStream(srtPath) },
    });
    present.add(language);
  }
  return [...present];
}

async function publishFormat(
  youtube: youtube_v3.Youtube,
  receipt: UploadReceipt,
  existingUploads: Map<string, { videoId: string; privacyStatus?: string }>,
  format: "long" | "short",
  playlistId: string,
): Promise<FormatReceipt> {
  const isShort = format === "short";
  const title = isShort ? SHORT_TITLE : LONG_TITLE;
  const videoPath = path.join(OUT, isShort ? "unicode-chronology-short.mp4" : "unicode-chronology-long.mp4");
  const thumbPath = path.join(OUT, isShort ? "unicode-chronology-short-thumb.jpg" : "unicode-chronology-thumb.jpg");
  const subDir = path.join(OUT, "subtitles", format);
  const longUrl = receipt.long?.url ?? `https://youtu.be/${receipt.long?.videoId}`;
  const description = isShort ? buildShortDescription(longUrl) : buildLongDescription();
  const tags = [
    "유니코드", "Unicode", "유니코드 1.0", "유니코드 18.0", "한자 통합", "문자 인코딩", "한글", "토토어",
    isShort ? "Shorts" : "컴퓨터 역사",
  ];

  await fs.access(videoPath);
  await fs.access(thumbPath);

  let entry = receipt[format];
  if (!entry?.videoId) {
    const found = existingUploads.get(title);
    if (found?.videoId) {
      entry = {
        videoId: found.videoId,
        url: isShort ? `https://www.youtube.com/shorts/${found.videoId}` : `https://youtu.be/${found.videoId}`,
        title,
        privacyStatus: found.privacyStatus ?? "public",
      };
    } else {
      console.log(`[${format}] Uploading ${path.basename(videoPath)}...`);
      const insertRes = await youtube.videos.insert({
        part: ["snippet", "status"],
        notifySubscribers: true,
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: "28",
            defaultLanguage: "ko",
            defaultAudioLanguage: "ko",
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          mimeType: "video/mp4",
          body: createReadStream(videoPath),
        },
      });
      const videoId = insertRes.data.id;
      if (!videoId) throw new Error(`${format}: YouTube did not return videoId`);
      entry = {
        videoId,
        url: isShort ? `https://www.youtube.com/shorts/${videoId}` : `https://youtu.be/${videoId}`,
        title,
        privacyStatus: "public",
        uploadedAt: new Date().toISOString(),
      };
    }
    receipt[format] = entry;
    await saveReceipt(receipt);
  } else {
    console.log(`[${format}] Resuming existing videoId ${entry.videoId}`);
  }

  if (!entry.thumbnailUploaded) {
    try {
      await youtube.thumbnails.set({
        videoId: entry.videoId,
        media: { mimeType: "image/jpeg", body: createReadStream(thumbPath) },
      });
      entry.thumbnailUploaded = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[${format}] 썸네일 업로드 건너뜀 (${msg}).`);
      entry.thumbnailUploaded = false;
    }
    await saveReceipt(receipt);
  }

  entry.captions = await ensureCaptions(youtube, entry.videoId, subDir);
  await saveReceipt(receipt);

  await ensurePlaylistItem(youtube, playlistId, entry.videoId);
  entry.playlistId = playlistId;
  await saveReceipt(receipt);

  return entry;
}

async function verifyLive(youtube: youtube_v3.Youtube, receipt: UploadReceipt): Promise<void> {
  const ids = [receipt.long?.videoId, receipt.short?.videoId].filter(Boolean) as string[];
  if (!ids.length) throw new Error("검증할 videoId가 없습니다.");

  const videos = await youtube.videos.list({
    part: ["snippet", "status", "processingDetails", "contentDetails"],
    id: ids,
  });

  for (const item of videos.data.items ?? []) {
    const existingEntry = receipt.long?.videoId === item.id ? receipt.long : receipt.short?.videoId === item.id ? receipt.short : undefined;
    let langs = existingEntry?.captions ?? [];
    try {
      const caps = await youtube.captions.list({ part: ["snippet"], videoId: item.id! });
      langs = [...new Set((caps.data.items ?? []).map(c => c.snippet?.language).filter(Boolean) as string[])].sort();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[verify] ${item.id} 자막 목록 API 조회 건너뜀 (${msg}); 기존 확인값 유지.`);
    }
    console.log(
      `LIVE ${item.id} | privacy=${item.status?.privacyStatus} | upload=${item.status?.uploadStatus} | processing=${item.processingDetails?.processingStatus} | duration=${item.contentDetails?.duration} | captions=${langs.join(",")}`,
    );
    if (receipt.long?.videoId === item.id) {
      receipt.long.processingStatus = item.processingDetails?.processingStatus ?? undefined;
      receipt.long.privacyStatus = item.status?.privacyStatus ?? receipt.long.privacyStatus;
      receipt.long.captions = langs;
    }
    if (receipt.short?.videoId === item.id) {
      receipt.short.processingStatus = item.processingDetails?.processingStatus ?? undefined;
      receipt.short.privacyStatus = item.status?.privacyStatus ?? receipt.short.privacyStatus;
      receipt.short.captions = langs;
    }
  }

  if (receipt.playlistId) {
    const pl = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: receipt.playlistId,
      maxResults: 50,
    });
    const plIds = (pl.data.items ?? []).map(i => i.snippet?.resourceId?.videoId);
    if (receipt.long && plIds.includes(receipt.long.videoId)) receipt.long.playlistId = receipt.playlistId;
    if (receipt.short && plIds.includes(receipt.short.videoId)) receipt.short.playlistId = receipt.playlistId;
    console.log(`PLAYLIST ${receipt.playlistId} (${PLAYLIST_TITLE}): ${plIds.join(", ")}`);
  }
  await saveReceipt(receipt);
}

async function main() {
  const verifyOnly = process.argv.includes("--verify-only");
  const youtube = await getAuthorizedYouTubeClient();
  const receipt = await loadReceipt();

  if (!verifyOnly) {
    const existingUploads = await fetchChannelUploads(youtube);
    const playlistId = await resolveOrCreatePlaylist(youtube, receipt);
    await publishFormat(youtube, receipt, existingUploads, "long", playlistId);
    await publishFormat(youtube, receipt, existingUploads, "short", playlistId);
  }
  await verifyLive(youtube, receipt);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
