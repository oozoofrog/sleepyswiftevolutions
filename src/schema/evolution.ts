import { z } from "zod";

export const EvolutionAuthorSchema = z
  .object({
    name: z.string(),
    link: z.string().optional().default(""),
  })
  .passthrough();

export const EvolutionStatusSchema = z
  .object({
    state: z.string(),
    version: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
  })
  .passthrough();

export const EvolutionProposalSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    summary: z.string().optional().default(""),
    link: z.string(),
    sha: z.string().optional().default(""),
    status: EvolutionStatusSchema,
    authors: z.array(EvolutionAuthorSchema).optional().default([]),
    reviewManagers: z.array(EvolutionAuthorSchema).optional().default([]),
    discussions: z.array(z.unknown()).optional().default([]),
    trackingBugs: z.array(z.unknown()).optional().default([]),
  })
  .passthrough();

export const EvolutionFeedSchema = z
  .object({
    commit: z.string(),
    creationDate: z.string(),
    implementationVersions: z.array(z.string()).optional().default([]),
    proposals: z.array(EvolutionProposalSchema),
  })
  .passthrough();

export type EvolutionAuthor = z.infer<typeof EvolutionAuthorSchema>;
export type EvolutionStatus = z.infer<typeof EvolutionStatusSchema>;
export type EvolutionProposal = z.infer<typeof EvolutionProposalSchema>;
export type EvolutionFeed = z.infer<typeof EvolutionFeedSchema>;

export const EpisodeStageSchema = z.enum([
  "pending",
  "initialized",
  "scripted",
  "voiced",
  "rendered",
  "uploaded",
]);
export type EpisodeStage = z.infer<typeof EpisodeStageSchema>;

export const UploadRecordSchema = z.object({
  videoId: z.string(),
  url: z.string(),
  uploadedAt: z.string(),
  privacyStatus: z.enum(["private", "unlisted", "public"]),
  publishAt: z.string().optional(),
  title: z.string(),
  playlists: z.array(z.string()).default([]),
  captionsUploaded: z.boolean().default(false),
  thumbnailUploaded: z.boolean().default(false),
});
export type UploadRecord = z.infer<typeof UploadRecordSchema>;

export const FormatProgressSchema = z.object({
  voicedAt: z.string().optional(),
  renderedAt: z.string().optional(),
  durationSec: z.number().optional(),
  upload: UploadRecordSchema.optional(),
});
export type FormatProgress = z.infer<typeof FormatProgressSchema>;

export const EpisodeStateSchema = z.object({
  id: z.string(),
  episodeNumber: z.number().int().positive(),
  title: z.string(),
  proposalState: z.string(),
  swiftVersion: z.string().optional(),
  stage: EpisodeStageSchema,
  updatedAt: z.string(),
  formats: z
    .object({
      long: FormatProgressSchema.optional(),
      short: FormatProgressSchema.optional(),
    })
    .default({}),
});
export type EpisodeState = z.infer<typeof EpisodeStateSchema>;

export const WorkspaceStateSchema = z.object({
  lastSyncedAt: z.string(),
  evolutionCommit: z.string(),
  episodes: z.record(z.string(), EpisodeStateSchema).default({}),
  playlistCache: z.record(z.string(), z.string()).default({}),
});
export type WorkspaceState = z.infer<typeof WorkspaceStateSchema>;
