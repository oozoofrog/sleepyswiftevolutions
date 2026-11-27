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

const DrawingCue = z.object({ cue: z.string().trim().min(1), offsetSec: z.number().nonnegative() });
const DrawingPoint = z.object({ x: z.number(), y: z.number() });

const CodePanelName = z.enum(["code", "codeBefore", "codeAfter"]);
const CodeTargetSchema = z.object({ line: z.number().int().positive(), text: z.string().min(1) });
export type CodeTarget = z.infer<typeof CodeTargetSchema>;
const SpokenReference = z.object({
  phrase: z.string().trim().min(1),
  offsetSec: z.number().nonnegative(),
  lines: z.array(z.number().int().positive()).min(1),
  panel: CodePanelName.optional(),
  targets: z.array(CodeTargetSchema).min(1).optional(),
});

const SpeechSchema = z.array(z.object({
  language: z.enum(["ko", "en"]),
  text: z.string().trim().min(1),
  caption: z.string().trim().min(1),
  direction: z.object({
    drawingPhase: z.enum(["ready", "move", "hold", "draw", "complete"]).optional(),
    stages: z.array(z.string().min(1)).min(1).max(3),
    panel: CodePanelName.optional(),
    references: z.array(SpokenReference).optional(),
    lines: z.array(z.number().int().positive()).optional(),
  }).optional(),
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
  people: z.array(z.object({
    cue: z.string().trim().min(1),
    name: z.string().trim().min(1),
    account: z.string().trim().min(1),
    role: z.string().trim().min(1).optional(),
    profile: z.string().url(),
    photo: z.object({
      file: z.string().regex(/^people\/[\w.-]+$/),
      source: z.string().url(),
      credit: z.string().min(1),
    }).optional(),
  })).optional(),
  deliveryNote: z.string().trim().min(1).optional(),
  speech: SpeechSchema.optional(),
  milestones: z.array(z.object({
    date: z.string().trim().min(1),
    event: z.string().trim().min(1),
    sourceUrl: z.string().url(),
  })).min(1).max(3).optional(),
  codeSteps: z.array(z.object({
    cue: z.string().min(1),
    focus: z.string().min(1),
    example: z.string().min(1),
  })).min(1).optional(),
  valueFlow: z.object({
    mode: z.enum(["local", "inout"]),
    mutateCue: z.string().trim().min(1),
    returnCue: z.string().trim().min(1),
  }).optional(),
  codeReveal: z.object({
    parts: z.array(z.union([z.string().min(1), z.object({ remove: z.string().min(1) })])).min(2),
    answerCue: z.string().trim().min(1),
  }).optional(),
  bullets: z.array(z.string()).optional(),
  badge: z.string().optional(),
  pathDestination: DrawingPoint.optional(),
  drawingEntrance: z.object({ mark: DrawingCue, place: DrawingCue }).optional(),
  drawingCorners: z.array(DrawingPoint).min(1).optional(),
  comparisonStyle: z.literal("parallel").optional(),
  comparisonFocus: z.object({
    cue: z.string().trim().min(1),
    codeBefore: z.string().min(1),
    codeAfter: z.string().min(1),
  }).optional(),
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
  if (scene.valueFlow) {
    const { mutateCue, returnCue } = scene.valueFlow;
    const speeches = scene.shortNarration ? [scene.speech, scene.shortSpeech] : [scene.speech];
    for (const speech of speeches) {
      const mutation = speech?.findIndex(part => part.caption.includes(mutateCue)) ?? -1;
      const completion = speech?.findIndex(part => part.caption.includes(returnCue)) ?? -1;
      if (!scene.code || mutation < 1 || completion <= mutation) {
        ctx.addIssue({ code: "custom", path: ["valueFlow"], message: "코드와 호출, 대입, 종료 순서의 음성 구간이 필요합니다." });
        break;
      }
    }
  }
  if (scene.drawingEntrance) {
    for (const event of Object.values(scene.drawingEntrance)) {
      if (!scene.pathDestination || !scene.drawingCorners || !scene.speech?.some(part => part.caption.startsWith(event.cue))) {
        ctx.addIssue({ code: "custom", path: ["drawingEntrance"], message: "시작점과 꼭짓점 및 대사에 있는 시작 문구가 필요합니다." });
      }
    }
  }
  const focus = scene.comparisonFocus;
  if (focus && (scene.comparisonStyle !== "parallel" ||
      !scene.speech?.some(part => part.caption.startsWith(focus.cue)) ||
      (["codeBefore", "codeAfter"] as const).some(panel =>
        scene[panel]?.code.split(focus[panel]).length !== 2 || focus[panel].includes("\n")))) {
    ctx.addIssue({ code: "custom", path: ["comparisonFocus"], message: "비교할 두 코드에 각각 한 번 나오는 구절과 대사의 시작 문구가 필요합니다." });
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
    if (parts.some(part => part.direction)) {
      parts.forEach(({ direction }, index) => {
        const snippet = direction?.panel && scene[direction.panel];
        direction?.references?.forEach((ref, i, refs) => {
          const panel = ref.panel ?? direction.panel;
          const code = panel && scene[panel];
          const targetLines = new Set<number>();
          for (const { line, text } of ref.targets ?? []) {
            const content = code?.code.split("\n")[line - 1] ?? "";
            if (!ref.lines.includes(line) || targetLines.has(line) || content.indexOf(text) < 0 ||
                content.indexOf(text) !== content.lastIndexOf(text)) {
              ctx.addIssue({ code: "custom", path: [key, index, "direction", "references", i, "targets"],
                message: "각 줄에서 한 번만 나오는 코드 조각을 하나씩 지정하세요." });
            }
            targetLines.add(line);
          }
          if (!code || !parts[index].caption.includes(ref.phrase) ||
              ref.lines.some(line => line > code.code.split("\n").length) ||
              (i > 0 && ref.offsetSec <= refs[i - 1].offsetSec)) {
            ctx.addIssue({ code: "custom", path: [key, index, "direction", "references", i],
              message: "대사에 있는 문구와 해당 코드 줄을 발화 시간 순서로 지정하세요." });
          }
        });
        if (!direction || (direction.panel && !snippet) ||
            direction.lines?.some(line => !snippet || line > snippet.code.split("\n").length)) {
          ctx.addIssue({ code: "custom", path: [key, index, "direction"], message: "각 대사의 연출과 실제 코드 줄을 지정해야 합니다." });
        }
      });
    }
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

const MusicFile = z.string().regex(/^[a-zA-Z0-9_-]+\.(m4a|mp3|wav)$/);

export const EpisodeScriptSchema = z.object({
  schemaVersion: z.literal(1),
  visualStyle: z.literal("archive-print").optional(),
  showStageLabels: z.boolean().optional(),
  sceneTransition: z.enum(["fade-through", "shared-layout"]).optional(),
  animateLineHighlight: z.boolean().optional(),
  shortCloneTempo: z.number().min(1).max(2).optional(),
  narrationMix: z.literal("soft").optional(),
  backgroundMusic: z.union([
    MusicFile,
    z.object({ file: MusicFile, duckUnderNarration: z.literal(true) }),
  ]).optional(),
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
  endingDigest: z.string().regex(/^[a-f0-9]{64}$/).optional(),
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
