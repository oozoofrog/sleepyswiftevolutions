import assert from "node:assert/strict";
import test from "node:test";
import { normalizeProposalId, parseProposalNumber } from "../src/lib/paths";
import { buildFallbackCues, formatChapterTimestamp, formatSrt, formatYouTubeChapters, parseSrtOrVtt } from "../src/lib/subtitle";
import { tokenizeSwift } from "../src/lib/swift-highlight";
import { buildSceneTimeline, getEffectiveShortsScenes } from "../src/lib/timeline";
import { SAMPLE_SCRIPT } from "../src/remotion/sample-props";
import { EpisodeScriptSchema } from "../src/schema/script";

test("normalizeProposalId handles numeric and prefixed variants", () => {
  assert.equal(normalizeProposalId("1"), "SE-0001");
  assert.equal(normalizeProposalId("0001"), "SE-0001");
  assert.equal(normalizeProposalId("se-42"), "SE-0042");
  assert.equal(normalizeProposalId("SE-0569"), "SE-0569");
  assert.equal(parseProposalNumber("se-12"), 12);
  assert.throws(() => normalizeProposalId("abc"));
  assert.throws(() => normalizeProposalId("0"));
});

test("tokenizeSwift highlights keywords, backtick labels, strings, and attributes", () => {
  const code = `@MainActor
func indexOf(_ value: Int, \`in\` list: [Int]) -> Int? {
  // comment
  let msg = "hello"
  return list.firstIndex(of: value)
}`;
  const lines = tokenizeSwift(code);
  assert.equal(lines.length, 6);

  assert.equal(lines[0][0].kind, "attribute");
  assert.equal(lines[0][0].text, "@MainActor");

  const line2Kinds = lines[1].map((t) => `${t.kind}:${t.text}`);
  assert.ok(line2Kinds.includes("keyword:func"));
  assert.ok(line2Kinds.includes("function:indexOf"));
  assert.ok(line2Kinds.includes("backtick:`in`"));

  assert.ok(lines[2].some((t) => t.kind === "comment" && t.text.includes("// comment")));
  assert.ok(lines[3].some((t) => t.kind === "string" && t.text === '"hello"'));
});

test("parseSrtOrVtt and formatSrt round-trip subtitles cleanly", () => {
  const sampleVtt = `WEBVTT

00:00:00.000 --> 00:00:01.100
안녕하세요

00:00:01.150 --> 00:00:02.400
스위프트 에볼루션입니다.

00:00:03.000 --> 00:00:04.500
두 번째 문장입니다.`;

  const cues = parseSrtOrVtt(sampleVtt);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].text, "안녕하세요 스위프트 에볼루션입니다.");
  assert.equal(cues[1].text, "두 번째 문장입니다.");

  const srt = formatSrt(cues);
  assert.ok(srt.includes("00:00:00,000 --> 00:00:02,400"));
  assert.ok(srt.includes("00:00:03,000 --> 00:00:04,500"));

  const fallback = buildFallbackCues("첫 번째 문장입니다. 두 번째 문장도 있습니다.", 6);
  assert.equal(fallback.length, 2);
  assert.equal(fallback[1].endSec, 6);
});

test("EpisodeScriptSchema validates SAMPLE_SCRIPT and computes Shorts scenes and chapters", () => {
  const parsed = EpisodeScriptSchema.parse(SAMPLE_SCRIPT);
  assert.equal(parsed.proposalId, "SE-0001");

  const shorts = getEffectiveShortsScenes(parsed);
  assert.equal(shorts.length, 2); // 03-outro has includeInShort: false

  const timeline = buildSceneTimeline(parsed, "long");
  assert.ok(timeline.totalFrames > 0);
  assert.equal(timeline.scenes.length, 3);

  assert.equal(formatChapterTimestamp(0), "00:00");
  assert.equal(formatChapterTimestamp(65), "01:05");

  const chapters = formatYouTubeChapters(parsed.scenes);
  assert.ok(chapters.startsWith("00:00 인트로"));
  assert.ok(chapters.includes("Before & After"));
});

test("spoken English can differ from captions without leaking long-form speech into Shorts", () => {
  const script = structuredClone(SAMPLE_SCRIPT);
  const scene = script.scenes[0];
  scene.narration = "indexOf를 호출합니다.";
  scene.speech = [
    { language: "en", caption: "indexOf", text: "index of" },
    { language: "ko", caption: "를 호출합니다.", text: "를 호출합니다." },
  ];
  scene.shortNarration = "짧은 설명입니다.";
  assert.ok(EpisodeScriptSchema.safeParse(script).success);
  assert.equal(getEffectiveShortsScenes(script)[0].speech, undefined);
  scene.shortSpeech = [{ language: "ko", caption: scene.shortNarration, text: scene.shortNarration }];
  assert.deepEqual(getEffectiveShortsScenes(script)[0].speech, scene.shortSpeech);
  scene.speech[0].caption = "다른 식별자";
  assert.equal(EpisodeScriptSchema.safeParse(script).success, false);
});

test("a code reveal requires both visible and removable code and a later speech cue", () => {
  const script = structuredClone(SAMPLE_SCRIPT);
  const intro = script.scenes[0];
  delete intro.shortNarration;
  intro.narration = "어디가 달라질까요? 쏙 빠집니다.";
  intro.speech = ["어디가 달라질까요?", "쏙 빠집니다."].map(caption => ({language: "ko", text: caption, caption}));
  intro.codeReveal = {parts: ["a", {remove: "b"}], answerCue: "쏙 빠집니다."};
  assert.ok(EpisodeScriptSchema.safeParse(script).success);
  intro.codeReveal.answerCue = "없는 구간";
  assert.equal(EpisodeScriptSchema.safeParse(script).success, false);
  intro.codeReveal = {parts: ["a", "b"], answerCue: "쏙 빠집니다."};
  assert.equal(EpisodeScriptSchema.safeParse(script).success, false);
});

test("preview keeps a question pause and joins a mid-sentence reveal", () => {
  const script = structuredClone(SAMPLE_SCRIPT);
  script.scenes[0].speech = [
    { language: "ko", caption: "보이세요? 백틱이", text: "보이세요? 백틱이" },
    { language: "ko", caption: "쏙 빠집니다.", text: "쏙 빠집니다." },
  ];
  const [question, lead, reveal] = buildSceneTimeline(script, "long").scenes[0].cues;
  assert.ok(Math.abs(lead.startSec - question.endSec - 0.65) < 0.001);
  assert.equal(lead.endSec, reveal.startSec);
});
