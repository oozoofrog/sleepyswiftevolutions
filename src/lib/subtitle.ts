import type { AudioManifest, Scene, SubtitleCue } from "../schema/script";

function parseTimestampToSeconds(raw: string): number {
  const cleaned = raw.trim().replace(",", ".");
  const parts = cleaned.split(":");
  if (parts.length === 3) {
    const hours = Number.parseFloat(parts[0]);
    const minutes = Number.parseFloat(parts[1]);
    const seconds = Number.parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const minutes = Number.parseFloat(parts[0]);
    const seconds = Number.parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

function formatSrtTimestamp(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const totalMs = Math.round(clamped * 1000);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export function formatChapterTimestamp(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Merges short word/phrase cues (e.g. from Edge TTS) into readable Korean subtitle lines (~18-32 chars).
 */
export function mergeShortCues(cues: SubtitleCue[], maxChars = 32): SubtitleCue[] {
  if (cues.length <= 1) return cues;

  const merged: SubtitleCue[] = [];
  let current: SubtitleCue | null = null;

  for (const cue of cues) {
    const text = cue.text.replace(/\s+/g, " ").trim();
    if (!text) continue;

    if (!current) {
      current = { startSec: cue.startSec, endSec: cue.endSec, text };
      continue;
    }

    const combined = `${current.text} ${text}`.trim();
    const endsSentence = /[.!?。]$/.test(current.text);
    const gap = cue.startSec - current.endSec;

    if (!endsSentence && gap < 0.45 && combined.length <= maxChars) {
      current.endSec = Math.max(current.endSec, cue.endSec);
      current.text = combined;
    } else {
      merged.push(current);
      current = { startSec: cue.startSec, endSec: cue.endSec, text };
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}

/**
 * Parses SRT or WebVTT content into normalized SubtitleCue entries.
 */
export function parseSrtOrVtt(content: string): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  const blocks = normalized.split(/\n{2,}/);
  const rawCues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    if (lines[0].startsWith("WEBVTT") || lines[0].startsWith("NOTE")) continue;

    const timeLineIndex = lines.findIndex((line) => line.includes("-->"));
    if (timeLineIndex === -1) continue;

    const timeLine = lines[timeLineIndex];
    const [startRaw, endRawWithMeta] = timeLine.split("-->");
    if (!startRaw || !endRawWithMeta) continue;

    const endRaw = endRawWithMeta.trim().split(/\s+/)[0];
    const startSec = Number(parseTimestampToSeconds(startRaw).toFixed(3));
    const endSec = Number(parseTimestampToSeconds(endRaw).toFixed(3));
    const text = lines
      .slice(timeLineIndex + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (text && endSec > startSec) {
      rawCues.push({ startSec, endSec, text });
    }
  }

  return mergeShortCues(rawCues);
}

/**
 * Splits Korean text into natural subtitle chunks and distributes duration proportionally.
 */
export function buildFallbackCues(text: string, durationSec: number): SubtitleCue[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  // Split first by sentence endings, then chunk long sentences around spaces
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= 34) {
      chunks.push(sentence);
      continue;
    }
    const words = sentence.split(" ");
    let buf = "";
    for (const word of words) {
      const candidate = buf ? `${buf} ${word}` : word;
      if (candidate.length > 30 && buf) {
        chunks.push(buf);
        buf = word;
      } else {
        buf = candidate;
      }
    }
    if (buf) chunks.push(buf);
  }

  if (chunks.length === 0) {
    return [{ startSec: 0, endSec: durationSec, text: clean }];
  }

  const weights = chunks.map((c) => Math.max(1, c.replace(/\s+/g, "").length));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const cues: SubtitleCue[] = [];
  let cursor = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    const share = (weights[i] / totalWeight) * durationSec;
    const startSec = Number(cursor.toFixed(3));
    const endSec = i === chunks.length - 1 ? Number(durationSec.toFixed(3)) : Number((cursor + share).toFixed(3));
    cues.push({ startSec, endSec, text: chunks[i] });
    cursor += share;
  }

  return cues;
}

export interface AlignedWordSpan {
  text: string;
  startSec: number;
  endSec: number;
}

/**
 * Groups forced-aligned word/token timestamps into readable Korean subtitle lines (~18-30 chars),
 * breaking at natural pauses (>= 0.35s), sentence-ending punctuation, or line length bounds.
 */
export function groupAlignedWordsToCues(
  spans: AlignedWordSpan[],
  originalText: string,
  durationSec: number,
  maxChars = 30,
): SubtitleCue[] {
  const valid = spans
    .map((span) => ({
      text: span.text.replace(/\s+/g, " ").trim(),
      startSec: Math.max(0, Math.min(durationSec, span.startSec)),
      endSec: Math.max(0, Math.min(durationSec, span.endSec)),
    }))
    .filter((span) => span.text.length > 0 && span.endSec > span.startSec)
    .sort((a, b) => a.startSec - b.startSec);

  if (valid.length === 0) {
    return buildFallbackCues(originalText, durationSec);
  }

  const cues: SubtitleCue[] = [];
  let current: SubtitleCue | null = null;

  for (const span of valid) {
    if (!current) {
      current = {
        startSec: Number(span.startSec.toFixed(3)),
        endSec: Number(span.endSec.toFixed(3)),
        text: span.text,
      };
      continue;
    }

    const gap = span.startSec - current.endSec;
    const endsSentence = /[.!?。]$/.test(current.text);
    const candidate = `${current.text} ${span.text}`.trim();

    if (!endsSentence && gap < 0.35 && candidate.length <= maxChars) {
      current.endSec = Number(Math.max(current.endSec, span.endSec).toFixed(3));
      current.text = candidate;
    } else {
      cues.push(current);
      current = {
        startSec: Number(span.startSec.toFixed(3)),
        endSec: Number(span.endSec.toFixed(3)),
        text: span.text,
      };
    }
  }

  if (current) {
    cues.push(current);
  }

  return cues.filter((cue) => cue.endSec > cue.startSec);
}

/**
 * Formats SubtitleCue array into standard UTF-8 SRT subtitle text.
 */
export function formatSrt(cues: SubtitleCue[]): string {
  return cues
    .map(
      (cue, index) =>
        `${index + 1}\n${formatSrtTimestamp(cue.startSec)} --> ${formatSrtTimestamp(cue.endSec)}\n${cue.text}\n`,
    )
    .join("\n");
}

/**
 * Generates YouTube chapter timestamps from scenes and an optional AudioManifest.
 */
export function formatYouTubeChapters(scenes: Scene[], manifest?: AudioManifest): string {
  if (manifest && manifest.scenes.length > 0) {
    const entryMap = new Map(manifest.scenes.map((s) => [s.sceneId, s]));
    return scenes
      .map((scene) => {
        const entry = entryMap.get(scene.id);
        const start = entry ? entry.startSec : 0;
        return `${formatChapterTimestamp(start)} ${scene.chapterTitle}`;
      })
      .join("\n");
  }

  let cursor = 0;
  return scenes
    .map((scene) => {
      const ts = formatChapterTimestamp(cursor);
      const compact = scene.narration.replace(/\s+/g, "").length;
      cursor += Math.max(3, compact / 4.5 + 0.8);
      return `${ts} ${scene.chapterTitle}`;
    })
    .join("\n");
}
