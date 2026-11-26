import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  EVOLUTION_JSON_PATH,
  PROPOSALS_CACHE_DIR,
  normalizeProposalId,
  parseProposalNumber,
} from "./paths";
import { loadWorkspaceState, saveWorkspaceState } from "./state";
import {
  type EpisodeState,
  type EvolutionFeed,
  EvolutionFeedSchema,
  type EvolutionProposal,
} from "../schema/evolution";

export const EVOLUTION_FEED_URL = "https://download.swift.org/swift-evolution/v1/evolution.json";
export const PROPOSAL_RAW_BASE_URL =
  "https://raw.githubusercontent.com/swiftlang/swift-evolution/main/proposals";
export const PROPOSAL_BLOB_BASE_URL =
  "https://github.com/swiftlang/swift-evolution/blob/main/proposals";

export function getProposalGithubUrl(proposal: EvolutionProposal): string {
  return `${PROPOSAL_BLOB_BASE_URL}/${proposal.link}`;
}

export function getProposalRawUrl(proposal: EvolutionProposal): string {
  return `${PROPOSAL_RAW_BASE_URL}/${proposal.link}`;
}

function sortProposalsAscending(proposals: EvolutionProposal[]): EvolutionProposal[] {
  return [...proposals].sort((a, b) => {
    const numA = parseProposalNumber(a.id);
    const numB = parseProposalNumber(b.id);
    return numA - numB;
  });
}

/**
 * Fetches evolution.json from swift.org, caches it to data/evolution.json,
 * and reconciles data/state.json while preserving existing episode progress.
 */
export async function syncEvolutionFeed(): Promise<{
  feed: EvolutionFeed;
  addedCount: number;
  updatedCount: number;
}> {
  const response = await fetch(EVOLUTION_FEED_URL);
  if (!response.ok) {
    throw new Error(
      `Swift Evolution 피드를 가져오지 못했습니다 (${response.status} ${response.statusText})`,
    );
  }
  const json = await response.json();
  const feed = EvolutionFeedSchema.parse(json);

  await fs.mkdir(path.dirname(EVOLUTION_JSON_PATH), { recursive: true });
  const tmpPath = `${EVOLUTION_JSON_PATH}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmpPath, `${JSON.stringify(feed, null, 2)}\n`, "utf8");
  await fs.rename(tmpPath, EVOLUTION_JSON_PATH);

  const state = await loadWorkspaceState();
  const sorted = sortProposalsAscending(feed.proposals);
  const now = new Date().toISOString();

  let addedCount = 0;
  let updatedCount = 0;
  let implementedCounter = 0;

  for (const proposal of sorted) {
    if (proposal.status.state === "implemented") {
      implementedCounter += 1;
    }
    const existing = state.episodes[proposal.id];
    const desiredEpNum =
      existing?.episodeNumber ??
      (proposal.status.state === "implemented"
        ? implementedCounter
        : parseProposalNumber(proposal.id));

    if (!existing) {
      const created: EpisodeState = {
        id: proposal.id,
        episodeNumber: desiredEpNum,
        title: proposal.title,
        proposalState: proposal.status.state,
        swiftVersion: proposal.status.version,
        stage: "pending",
        updatedAt: now,
        formats: {},
      };
      state.episodes[proposal.id] = created;
      addedCount += 1;
    } else {
      const changed =
        existing.title !== proposal.title ||
        existing.proposalState !== proposal.status.state ||
        existing.swiftVersion !== proposal.status.version;
      if (changed) {
        existing.title = proposal.title;
        existing.proposalState = proposal.status.state;
        existing.swiftVersion = proposal.status.version;
        existing.updatedAt = now;
        updatedCount += 1;
      }
    }
  }

  state.lastSyncedAt = now;
  state.evolutionCommit = feed.commit;
  await saveWorkspaceState(state);

  return { feed, addedCount, updatedCount };
}

/**
 * Loads cached data/evolution.json, or runs syncEvolutionFeed() if missing.
 */
export async function loadEvolutionFeed(): Promise<EvolutionFeed> {
  try {
    const raw = await fs.readFile(EVOLUTION_JSON_PATH, "utf8");
    return EvolutionFeedSchema.parse(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      const { feed } = await syncEvolutionFeed();
      return feed;
    }
    throw error;
  }
}

/**
 * Resolves a proposal by ID ("SE-0001", "1") or "next" (first non-uploaded episode).
 */
export async function findProposal(
  idOrNext: string,
  options?: { includeAll?: boolean; version?: string },
): Promise<{ proposal: EvolutionProposal; feed: EvolutionFeed; episodeNumber: number }> {
  const feed = await loadEvolutionFeed();
  const state = await loadWorkspaceState();
  const sorted = sortProposalsAscending(feed.proposals);
  const includeAll = Boolean(options?.includeAll);
  const versionFilter = options?.version?.trim();

  if (idOrNext.trim().toLowerCase() === "next") {
    for (const proposal of sorted) {
      if (!includeAll && proposal.status.state !== "implemented") continue;
      if (versionFilter && proposal.status.version !== versionFilter) continue;

      const ep = state.episodes[proposal.id];
      const longDone = Boolean(ep?.formats.long?.upload);
      const shortDone = Boolean(ep?.formats.short?.upload);
      if ((longDone && shortDone) || (ep?.stage === "uploaded" && !ep.formats.long && !ep.formats.short)) {
        continue;
      }

      return {
        proposal,
        feed,
        episodeNumber: ep?.episodeNumber ?? parseProposalNumber(proposal.id),
      };
    }
    throw new Error("조건에 맞는 다음 미업로드 Proposal을 찾지 못했습니다.");
  }

  const normalized = normalizeProposalId(idOrNext);
  const proposal = feed.proposals.find((p) => p.id === normalized);
  if (!proposal) {
    throw new Error(`Swift Evolution 피드에서 ${normalized}를 찾을 수 없습니다.`);
  }

  const ep = state.episodes[proposal.id];
  return {
    proposal,
    feed,
    episodeNumber: ep?.episodeNumber ?? parseProposalNumber(proposal.id),
  };
}

/**
 * Finds the next proposal after a given ID (for outro "Next Episode" previews).
 */
export function findNextProposalAfter(
  feed: EvolutionFeed,
  currentId: string,
  includeAll = false,
): EvolutionProposal | undefined {
  const currentNum = parseProposalNumber(currentId);
  const sorted = sortProposalsAscending(feed.proposals);
  return sorted.find((p) => {
    const num = parseProposalNumber(p.id);
    if (num <= currentNum) return false;
    return includeAll || p.status.state === "implemented";
  });
}

function matchesProposal(markdown: string, proposal: EvolutionProposal): boolean {
  if (!proposal.sha) return markdown.length > 0;
  const hash = createHash("sha1").update(`blob ${Buffer.byteLength(markdown)}\0`).update(markdown);
  return hash.digest("hex") === proposal.sha;
}

async function readCachedProposal(proposal: EvolutionProposal): Promise<string | undefined> {
  try {
    const markdown = await fs.readFile(path.join(PROPOSALS_CACHE_DIR, proposal.link), "utf8");
    if (matchesProposal(markdown, proposal)) return markdown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return undefined;
}

export async function hasProposalSource(proposal: EvolutionProposal): Promise<boolean> {
  return (await readCachedProposal(proposal)) !== undefined;
}

/**
 * Loads proposal markdown from data/proposals/ cache or fetches it from GitHub.
 */
export async function fetchProposalMarkdown(
  proposal: EvolutionProposal,
  forceRefresh = false,
): Promise<string> {
  const cachePath = path.join(PROPOSALS_CACHE_DIR, proposal.link);
  if (!forceRefresh) {
    const markdown = await readCachedProposal(proposal);
    if (markdown !== undefined) return markdown;
  }

  const { commit } = await loadEvolutionFeed();
  const url = `https://raw.githubusercontent.com/swiftlang/swift-evolution/${commit}/proposals/${proposal.link}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Proposal 마크다운 다운로드 실패 (${proposal.id}): ${response.status} ${response.statusText} (${url})`,
    );
  }
  const markdown = await response.text();
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  if (!matchesProposal(markdown, proposal)) throw new Error(`원문 해시 불일치: ${proposal.id}`);
  const tmp = `${cachePath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmp, markdown, "utf8");
  await fs.rename(tmp, cachePath);
  return markdown;
}
