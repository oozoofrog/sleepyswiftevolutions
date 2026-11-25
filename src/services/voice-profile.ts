import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getConfig } from "../config/env";
import { probeAudioDurationSec } from "../lib/audio-probe";
import { writeJsonAtomic } from "../lib/state";

const execFileAsync = promisify(execFile);

export const DEFAULT_RECORDING_SCRIPT =
  "안녕하세요. Swift Evolution을 처음부터 끝까지 소개하는 채널입니다. " +
  "오늘은 함수 인자 레이블과 프로토콜 문법이 어떻게 발전했는지 코드와 함께 차근차근 살펴보겠습니다.";

export interface AudioInputDevice {
  index: string;
  name: string;
}

export interface VoiceProfileMetadata {
  audioPath: string;
  refText: string;
  durationSec?: number;
  createdAt?: string;
  source: "env" | "profile";
}

interface StoredProfileJson {
  version: 1;
  createdAt: string;
  sourceFile: string;
  durationSec: number;
  refText: string;
}

function getProfilePaths() {
  const config = getConfig();
  const dir = config.tts.voiceProfileDir;
  return {
    dir,
    referenceWav: path.join(dir, "reference.wav"),
    referenceTxt: path.join(dir, "reference.txt"),
    profileJson: path.join(dir, "profile.json"),
    testCloneMp3: path.join(dir, "test-clone.mp3"),
  };
}

/**
 * Lists macOS AVFoundation audio input devices using ffmpeg.
 */
export async function listAudioInputDevices(): Promise<AudioInputDevice[]> {
  let output = "";
  try {
    const res = await execFileAsync("ffmpeg", ["-f", "avfoundation", "-list_devices", "true", "-i", ""]);
    output = `${res.stdout}\n${res.stderr}`;
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    output = `${e.stdout ?? ""}\n${e.stderr ?? ""}`;
  }

  const lines = output.split(/\r?\n/);
  const devices: AudioInputDevice[] = [];
  let inAudioSection = false;

  for (const line of lines) {
    if (line.includes("AVFoundation audio devices:")) {
      inAudioSection = true;
      continue;
    }
    if (line.includes("AVFoundation video devices:")) {
      inAudioSection = false;
      continue;
    }
    if (!inAudioSection) continue;
    const match = /\[(\d+)\]\s+(.+)$/.exec(line);
    if (match) {
      devices.push({ index: match[1], name: match[2].trim() });
    }
  }
  return devices;
}

/**
 * Transcribes a Korean reference audio file locally via Qwen3-ASR.
 */
export async function transcribeAudioWithQwenAsr(wavPath: string): Promise<string> {
  const config = getConfig();
  const asrBin = config.tts.qwen3AsrBin;

  try {
    await fs.access(asrBin);
  } catch {
    throw new Error(
      `로컬 ASR 실행기를 찾을 수 없습니다: ${asrBin}\n--text 옵션으로 녹음 문장을 직접 전달해 주세요.`,
    );
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "se-qwen-asr-"));
  const outputStem = path.join(tmpDir, "transcript");

  try {
    await execFileAsync(
      asrBin,
      [
        "--audio",
        wavPath,
        "--language",
        "Korean",
        "--format",
        "txt",
        "--output-path",
        outputStem,
      ],
      {
        timeout: 120_000,
        env: {
          ...process.env,
          HF_HUB_OFFLINE: "1",
          TRANSFORMERS_OFFLINE: "1",
        },
      },
    );

    const txt = await fs.readFile(`${outputStem}.txt`, "utf8");
    const cleaned = txt.replace(/\s+/g, " ").trim().normalize("NFC");
    if (!cleaned) {
      throw new Error("Qwen3-ASR이 빈 전사 결과를 반환했습니다. --text로 문장을 직접 입력해 주세요.");
    }
    return cleaned;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

/**
 * Registers an existing voice recording (wav/m4a/mp3/aiff) into secrets/voice-profile/.
 */
export async function registerVoiceProfile(
  sourceAudioPath: string,
  options?: { text?: string },
): Promise<{ profile: VoiceProfileMetadata; warnings: string[] }> {
  const absSource = path.resolve(sourceAudioPath);
  try {
    await fs.access(absSource);
  } catch {
    throw new Error(`음성 파일을 찾을 수 없습니다: ${absSource}`);
  }

  const paths = getProfilePaths();
  await fs.mkdir(paths.dir, { recursive: true });

  // Convert to clean 24kHz mono 16-bit PCM WAV optimal for Qwen3-TTS Base voice cloning
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    absSource,
    "-ar",
    "24000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    paths.referenceWav,
  ]);

  const durationSec = await probeAudioDurationSec(paths.referenceWav);
  const warnings: string[] = [];
  if (durationSec < 3) {
    warnings.push(
      `녹음 길이(${durationSec.toFixed(1)}초)가 3초 미만입니다. 음색 복제 품질을 위해 5~15초 녹음을 권장합니다.`,
    );
  } else if (durationSec > 20) {
    warnings.push(
      `녹음 길이(${durationSec.toFixed(1)}초)가 20초를 넘습니다. 5~15초의 깔끔한 한두 문장이 가장 안정적입니다.`,
    );
  }

  const refText = options?.text?.trim()
    ? options.text.trim().normalize("NFC")
    : await transcribeAudioWithQwenAsr(paths.referenceWav);

  const createdAt = new Date().toISOString();
  const stored: StoredProfileJson = {
    version: 1,
    createdAt,
    sourceFile: path.basename(absSource),
    durationSec,
    refText,
  };

  await fs.writeFile(paths.referenceTxt, `${refText}\n`, "utf8");
  await writeJsonAtomic(paths.profileJson, stored);

  return {
    profile: {
      audioPath: paths.referenceWav,
      refText,
      durationSec,
      createdAt,
      source: "profile",
    },
    warnings,
  };
}

/**
 * Records directly from a macOS microphone via ffmpeg AVFoundation and registers the voice profile.
 */
export async function recordVoiceProfile(options?: {
  seconds?: number;
  device?: string;
  text?: string;
}): Promise<{ profile: VoiceProfileMetadata; warnings: string[] }> {
  const seconds = Math.max(3, Math.min(25, options?.seconds ?? 10));
  const device = options?.device?.trim() || "0";

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "se-voice-rec-"));
  const tmpWav = path.join(tmpDir, "recorded.wav");

  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-f",
        "avfoundation",
        "-i",
        `:${device}`,
        "-t",
        String(seconds),
        "-ar",
        "24000",
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        tmpWav,
      ],
      { timeout: (seconds + 15) * 1000 },
    );

    // Check peak volume to detect muted microphone or missing macOS permission
    let volumeStderr = "";
    try {
      const res = await execFileAsync("ffmpeg", ["-i", tmpWav, "-af", "volumedetect", "-f", "null", "-"]);
      volumeStderr = res.stderr;
    } catch (err) {
      const e = err as { stderr?: string };
      volumeStderr = e.stderr ?? "";
    }

    const maxVolMatch = /max_volume:\s*([-\d.]+)\s*dB/.exec(volumeStderr);
    const maxVolumeDb = maxVolMatch ? Number.parseFloat(maxVolMatch[1]) : undefined;

    const result = await registerVoiceProfile(tmpWav, { text: options?.text });
    if (maxVolumeDb !== undefined && maxVolumeDb < -50) {
      result.warnings.unshift(
        `녹음된 오디오 최대 음량이 매우 낮습니다(${maxVolumeDb.toFixed(1)} dB). 마이크 음소거 또는 터미널 마이크 권한을 확인하세요.`,
      );
    }
    return result;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

/**
 * Loads the active voice cloning profile from env overrides or secrets/voice-profile/.
 */
export async function loadVoiceProfile(): Promise<VoiceProfileMetadata | null> {
  const config = getConfig();

  if (config.tts.voiceProfileAudio) {
    try {
      await fs.access(config.tts.voiceProfileAudio);
      let refText = config.tts.voiceProfileText?.normalize("NFC") || "";
      if (!refText) {
        const siblingTxt = config.tts.voiceProfileAudio.replace(/\.[^.]+$/, ".txt");
        try {
          refText = (await fs.readFile(siblingTxt, "utf8")).trim().normalize("NFC");
        } catch {
          refText = await transcribeAudioWithQwenAsr(config.tts.voiceProfileAudio);
        }
      }
      const durationSec = await probeAudioDurationSec(config.tts.voiceProfileAudio).catch(
        () => undefined,
      );
      return {
        audioPath: config.tts.voiceProfileAudio,
        refText,
        durationSec,
        source: "env",
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        throw new Error(
          `VOICE_PROFILE_AUDIO 파일을 찾을 수 없습니다: ${config.tts.voiceProfileAudio}`,
        );
      }
      throw error;
    }
  }

  const paths = getProfilePaths();
  try {
    await fs.access(paths.referenceWav);
  } catch {
    return null;
  }

  let refText = "";
  let durationSec: number | undefined;
  let createdAt: string | undefined;

  try {
    const rawJson = await fs.readFile(paths.profileJson, "utf8");
    const parsed = JSON.parse(rawJson) as Partial<StoredProfileJson>;
    refText = parsed.refText?.trim().normalize("NFC") || "";
    durationSec = parsed.durationSec;
    createdAt = parsed.createdAt;
  } catch {
    // ignore missing profile.json and fall back to reference.txt
  }

  if (!refText) {
    try {
      refText = (await fs.readFile(paths.referenceTxt, "utf8")).trim().normalize("NFC");
    } catch {
      refText = await transcribeAudioWithQwenAsr(paths.referenceWav);
      await fs.writeFile(paths.referenceTxt, `${refText}\n`, "utf8");
    }
  }

  if (!durationSec) {
    durationSec = await probeAudioDurationSec(paths.referenceWav).catch(() => undefined);
  }

  return {
    audioPath: paths.referenceWav,
    refText,
    durationSec,
    createdAt,
    source: "profile",
  };
}

export function getVoiceProfileTestOutputPath(): string {
  return getProfilePaths().testCloneMp3;
}
