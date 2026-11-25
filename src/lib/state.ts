import fs from "node:fs/promises";
import path from "node:path";
import { STATE_JSON_PATH } from "./paths";
import {
  type EpisodeStage,
  type EpisodeState,
  type EvolutionFeed,
  type WorkspaceState,
  WorkspaceStateSchema,
} from "../schema/evolution";

const STAGE_ORDER: Record<EpisodeStage, number> = {
  pending: 0,
  initialized: 1,
  scripted: 2,
  voiced: 3,
  rendered: 4,
  uploaded: 5,
};

/**
 * Atomically writes a JSON file via temp file + rename.
 */
export async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(tmpPath, filePath);
}

/**
 * Loads workspace state from data/state.json or returns an empty default state.
 */
export async function loadWorkspaceState(): Promise<WorkspaceState> {
  try {
    const raw = await fs.readFile(STATE_JSON_PATH, "utf8");
    return WorkspaceStateSchema.parse(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return {
        lastSyncedAt: new Date(0).toISOString(),
        evolutionCommit: "",
        episodes: {},
        playlistCache: {},
      };
    }
    throw error;
  }
}

export async function saveWorkspaceState(state: WorkspaceState): Promise<void> {
  await writeJsonAtomic(STATE_JSON_PATH, state);
}

export function maxStage(a: EpisodeStage, b: EpisodeStage): EpisodeStage {
  return STAGE_ORDER[a] >= STAGE_ORDER[b] ? a : b;
}

/**
 * Updates a single episode record inside data/state.json atomically.
 */
export async function updateEpisodeState(
  id: string,
  updater: (prev: EpisodeState | undefined) => EpisodeState,
): Promise<EpisodeState> {
  const state = await loadWorkspaceState();
  const nextEpisode = updater(state.episodes[id]);
  state.episodes[id] = nextEpisode;
  await saveWorkspaceState(state);
  return nextEpisode;
}

export interface ProgressSummary {
  totalFeedProposals: number;
  targetCount: number;
  includeAll: boolean;
  versionFilter?: string;
  byStage: Record<EpisodeStage, number>;
  byProposalState: Record<string, number>;
  longUploadedCount: number;
  shortUploadedCount: number;
}

/**
 * Computes episode progress metrics across the Evolution feed and local state.
 */
export function computeProgressSummary(
  feed: EvolutionFeed,
  state: WorkspaceState,
  options?: { includeAll?: boolean; version?: string },
): ProgressSummary {
  const includeAll = Boolean(options?.includeAll);
  const versionFilter = options?.version?.trim();

  const byStage: Record<EpisodeStage, number> = {
    pending: 0,
    initialized: 0,
    scripted: 0,
    voiced: 0,
    rendered: 0,
    uploaded: 0,
  };
  const byProposalState: Record<string, number> = {};

  let targetCount = 0;
  let longUploadedCount = 0;
  let shortUploadedCount = 0;

  for (const proposal of feed.proposals) {
    const pState = proposal.status.state;
    byProposalState[pState] = (byProposalState[pState] ?? 0) + 1;

    if (!includeAll && pState !== "implemented") {
      continue;
    }
    if (versionFilter && proposal.status.version !== versionFilter) {
      continue;
    }

    targetCount += 1;
    const ep = state.episodes[proposal.id];
    const stage: EpisodeStage = ep?.stage ?? "pending";
    byStage[stage] += 1;

    if (ep?.formats.long?.upload) longUploadedCount += 1;
    if (ep?.formats.short?.upload) shortUploadedCount += 1;
  }

  return {
    totalFeedProposals: feed.proposals.length,
    targetCount,
    includeAll,
    versionFilter,
    byStage,
    byProposalState,
    longUploadedCount,
    shortUploadedCount,
  };
}
