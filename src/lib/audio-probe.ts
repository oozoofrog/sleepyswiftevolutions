import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Probes exact audio duration in seconds using ffprobe.
 */
export async function probeAudioDurationSec(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  const duration = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`ffprobe가 유효한 오디오 길이를 반환하지 않았습니다: ${filePath} ("${stdout.trim()}")`);
  }
  return Number(duration.toFixed(3));
}

/**
 * Converts any audio file (AIFF, WAV, M4A, MP3) into mono 44.1kHz MP3 via ffmpeg.
 */
export async function convertToMp3(inputPath: string, outputPath: string): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-ar",
    "44100",
    "-ac",
    "1",
    "-codec:a",
    "libmp3lame",
    "-qscale:a",
    "2",
    outputPath,
  ]);
}

export { estimateNarrationDurationSec } from "./timeline";
