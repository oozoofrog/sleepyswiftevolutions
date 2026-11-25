import { z } from "zod";

export const CodeSnippetSchema = z.object({
  label: z.string().optional(),
  filename: z.string().optional(),
  code: z.string().min(1),
  highlightLines: z.array(z.number().int().positive()).optional(),
  diffAddedLines: z.array(z.number().int().positive()).optional(),
  diffRemovedLines: z.array(z.number().int().positive()).optional(),
});
export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;

export const SceneTypeSchema = z.enum([
  "intro",
  "history",
  "problem",
  "code-compare",
  "code-focus",
  "key-points",
  "outro",
]);
export type SceneType = z.infer<typeof SceneTypeSchema>;

const SpeechSchema = z.array(z.object({
  language: z.enum(["ko", "en"]),
  text: z.string().trim().min(1),
  caption: z.string().trim().min(1),
})).min(1);

export const SceneSchema = z.object({
  id: z.string().min(1),
  type: SceneTypeSchema,
  chapterTitle: z.string().min(1),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  narration: z.string().min(1),
  termNotes: z.array(z.object({
    term: z.string().trim().min(1),
    meaning: z.string().trim().min(1),
    cue: z.string().trim().min(1),
  })).optional(),
  deliveryNote: z.string().trim().min(1).optional(),
  speech: SpeechSchema.optional(),
  milestones: z.array(z.object({
    date: z.string().trim().min(1),
    event: z.string().trim().min(1),
    sourceUrl: z.string().url(),
  })).min(1).max(3).optional(),
  codeReveal: z.object({
    parts: z.array(z.union([z.string().min(1), z.object({ remove: z.string().min(1) })])).min(2),
    answerCue: z.string().trim().min(1),
  }).optional(),
  bullets: z.array(z.string()).optional(),
  badge: z.string().optional(),
  codeBefore: CodeSnippetSchema.optional(),
  codeAfter: CodeSnippetSchema.optional(),
  code: CodeSnippetSchema.optional(),
  callout: z.string().optional(),
  includeInShort: z.boolean().optional(),
  shortNarration: z.string().optional(),
  shortSpeech: SpeechSchema.optional(),
}).superRefine((scene, ctx) => {
  if (scene.type === "history" && !scene.milestones) {
    ctx.addIssue({ code: "custom", path: ["milestones"], message: "연혁 장면에는 출처가 있는 사건이 필요합니다." });
  }
  const reveal = scene.codeReveal;
  if (reveal && (!reveal.parts.some(part => typeof part !== "string") ||
      !reveal.parts.some(part => typeof part === "string") ||
      !scene.speech?.slice(1).some(part => part.caption === reveal.answerCue) ||
      (scene.shortNarration?.trim() && !scene.shortSpeech?.slice(1).some(part => part.caption === reveal.answerCue)))) {
    ctx.addIssue({ code: "custom", path: ["codeReveal"], message: "유지할 코드, 지울 코드, 첫 구간 이후의 답변 자막이 필요합니다." });
  }
  for (const [key, narration] of [["speech", scene.narration], ["shortSpeech", scene.shortNarration]] as const) {
    const parts = scene[key];
    if (!parts) continue;
    const compact = (value: string) => value.replace(/\s+/gu, "");
    if (!narration || compact(parts.map(part => part.caption).join("")) !== compact(narration)) {
      ctx.addIssue({ code: "custom", path: [key], message: "구간 자막을 이어 붙인 내용이 해당 narration과 일치해야 합니다." });
    }
  }
});
export type Scene = z.infer<typeof SceneSchema>;

export const ThumbnailSpecSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  codeBefore: z.string().optional(),
  codeAfter: z.string().optional(),
  accentColor: z.string().optional(),
});
export type ThumbnailSpec = z.infer<typeof ThumbnailSpecSchema>;

export const YouTubeFormatMetaSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  playlistNames: z.array(z.string()).default([]),
  categoryId: z.string().default("28"),
  defaultLanguage: z.string().default("ko"),
});
export type YouTubeFormatMeta = z.infer<typeof YouTubeFormatMetaSchema>;

export const EpisodeScriptSchema = z.object({
  schemaVersion: z.literal(1),
  proposalId: z.string().regex(/^SE-\d{4,}$/),
  episodeNumber: z.number().int().positive(),
  swiftVersion: z.string().min(1),
  proposalState: z.string().min(1),
  proposalTitle: z.string().min(1),
  koreanTitle: z.string().min(1),
  authors: z.array(z.string()).default([]),
  proposalUrl: z.string().url(),
  thumbnail: ThumbnailSpecSchema,
  scenes: z.array(SceneSchema).min(3),
  shortsScenes: z.array(SceneSchema).min(2).optional(),
  youtube: z.object({
    long: YouTubeFormatMetaSchema,
    short: YouTubeFormatMetaSchema,
  }),
});
export type EpisodeScript = z.infer<typeof EpisodeScriptSchema>;

export const SubtitleCueSchema = z.object({
  startSec: z.number().nonnegative(),
  endSec: z.number().nonnegative(),
  text: z.string(),
});
export type SubtitleCue = z.infer<typeof SubtitleCueSchema>;

export const SceneAudioEntrySchema = z.object({
  sceneId: z.string(),
  audioFile: z.string(),
  durationSec: z.number().positive(),
  leadInSec: z.number().nonnegative(),
  tailPadSec: z.number().nonnegative(),
  totalDurationSec: z.number().positive(),
  startSec: z.number().nonnegative(),
  endSec: z.number().positive(),
  cues: z.array(SubtitleCueSchema),
});
export type SceneAudioEntry = z.infer<typeof SceneAudioEntrySchema>;

export const AudioManifestSchema = z.object({
  proposalId: z.string(),
  format: z.enum(["long", "short"]),
  provider: z.string(),
  voice: z.string(),
  fps: z.number().int().positive(),
  totalDurationSec: z.number().positive(),
  totalFrames: z.number().int().positive(),
  generatedAt: z.string(),
  scenes: z.array(SceneAudioEntrySchema),
});
export type AudioManifest = z.infer<typeof AudioManifestSchema>;

export const RenderInputPropsSchema = z.object({
  script: EpisodeScriptSchema,
  format: z.enum(["long", "short"]),
  manifest: AudioManifestSchema.optional(),
});
export type RenderInputProps = z.infer<typeof RenderInputPropsSchema>;
