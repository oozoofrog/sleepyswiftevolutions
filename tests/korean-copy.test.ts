import assert from "node:assert/strict";
import test from "node:test";
import { checkKoreanCopy, checkScriptCopy } from "../src/lib/korean-copy";

test("Korean copy lint rejects vague place constructions but keeps literal technical terms", () => {
  for (const text of ["번호가 들어가는 자리는", "들어가느자리", "한 획이 되돌아온 자리", "한 획의 세 자리", "두 글자에 서로 다른 자리를 주었습니다."]) {
    assert.ok(checkKoreanCopy(text), text);
  }
  for (const text of ["획의 가장자리", "소수점 셋째 자리", "76행 73열", "기록으로 들어가 보겠습니다."]) {
    assert.equal(checkKoreanCopy(text), undefined, text);
  }
});
test("lint identifies the field in Shorts and ignores quoted code", () => {
  const paths: string[] = [];
  checkScriptCopy({shortsScenes:[{shortSpeech:[{text:"값이 들어갈 자리입니다."}],code:{code:"들어갈 자리"}}]}, p=>paths.push(p.join(".")));
  assert.deepEqual(paths, ["shortsScenes.0.shortSpeech.0.text"]);
});
test("the episode validation gate rejects a vague chapter title", async () => {
  const {readFileSync} = await import("node:fs");
  const {EpisodeScriptSchema} = await import("../src/schema/script");
  const script = JSON.parse(readFileSync(new URL("../episodes/SE-0006/script.json", import.meta.url), "utf8"));
  assert.ok(EpisodeScriptSchema.safeParse(script).success);
  script.scenes[0].chapterTitle = "새 값이 들어가는 자리";
  const result = EpisodeScriptSchema.safeParse(script);
  assert.ok(!result.success && result.error.issues.some(issue => issue.path.join(".") === "scenes.0.chapterTitle"));
});

test("chapter titles must name the event while 일 remains valid within other words", () => {
  assert.ok(checkKoreanCopy("글꼴에서 시작된 일"));
  for (const title of ["제록스의 중국어 글꼴 개발", "서울에서 시작된 일정", "서울에서 시작된 일주일", "글꼴 개발은 제록스에서 시작됐다"]) {
    assert.equal(checkKoreanCopy(title), undefined, title);
  }
});
