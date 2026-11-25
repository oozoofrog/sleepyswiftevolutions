import path from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = path.resolve(CURRENT_DIR, "../..");
export const DATA_DIR = path.join(PROJECT_ROOT, "data");
export const EVOLUTION_JSON_PATH = path.join(DATA_DIR, "evolution.json");
export const STATE_JSON_PATH = path.join(DATA_DIR, "state.json");
export const PROPOSALS_CACHE_DIR = path.join(DATA_DIR, "proposals");
export const EPISODES_DIR = path.join(PROJECT_ROOT, "episodes");
export const SECRETS_DIR = path.join(PROJECT_ROOT, "secrets");
export const REMOTION_ENTRY = path.join(PROJECT_ROOT, "src/remotion/index.ts");

export type VideoFormat = "long" | "short";

/**
 * Normalizes proposal identifiers like "1", "0001", "se-1", "SE-0001" into "SE-0001".
 */
export function normalizeProposalId(input: string): string {
  const cleaned = input.trim().toUpperCase();
  const match = /^(?:SE-?)?(\d+)$/.exec(cleaned);
  if (!match) {
    throw new Error(`올바르지 않은 Proposal ID 형식입니다: "${input}" (예: SE-0001 또는 1)`);
  }
  const num = Number.parseInt(match[1], 10);
  if (num <= 0) {
    throw new Error(`Proposal 번호는 1 이상이어야 합니다: "${input}"`);
  }
  return `SE-${String(num).padStart(4, "0")}`;
}

/**
 * Extracts numeric SE number from a proposal ID like "SE-0001" -> 1.
 */
export function parseProposalNumber(id: string): number {
  const normalized = normalizeProposalId(id);
  return Number.parseInt(normalized.slice(3), 10);
}

export interface EpisodePaths {
  id: string;
  dir: string;
  proposalMd: string;
  promptMd: string;
  scriptJson: string;
  renderPropsJson: string;
  audioDir: string;
  audioLongDir: string;
  audioShortDir: string;
  audioCustomDir: string;
  outDir: string;
  formatAudioDir: (format: VideoFormat) => string;
  manifestPath: (format: VideoFormat) => string;
  subtitlesPath: (format: VideoFormat) => string;
  videoPath: (format: VideoFormat) => string;
  thumbPath: (format: VideoFormat) => string;
}

/**
 * Returns all canonical file and directory paths for a given episode ID.
 */
export function getEpisodePaths(id: string): EpisodePaths {
  const normalized = normalizeProposalId(id);
  const dir = path.join(EPISODES_DIR, normalized);
  const audioDir = path.join(dir, "audio");
  const audioLongDir = path.join(audioDir, "long");
  const audioShortDir = path.join(audioDir, "short");
  const audioCustomDir = path.join(audioDir, "custom");
  const outDir = path.join(dir, "out");

  const formatAudioDir = (format: VideoFormat) => (format === "long" ? audioLongDir : audioShortDir);

  return {
    id: normalized,
    dir,
    proposalMd: path.join(dir, "proposal.md"),
    promptMd: path.join(dir, "prompt.md"),
    scriptJson: path.join(dir, "script.json"),
    renderPropsJson: path.join(dir, "render-props.json"),
    audioDir,
    audioLongDir,
    audioShortDir,
    audioCustomDir,
    outDir,
    formatAudioDir,
    manifestPath: (format) => path.join(formatAudioDir(format), "manifest.json"),
    subtitlesPath: (format) => path.join(formatAudioDir(format), "subtitles.srt"),
    videoPath: (format) =>
      path.join(outDir, format === "long" ? `${normalized}-16x9.mp4` : `${normalized}-9x16.mp4`),
    thumbPath: (format) =>
      path.join(outDir, format === "long" ? `${normalized}-thumb.png` : `${normalized}-short-thumb.png`),
  };
}
