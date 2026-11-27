import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { checkEndings, checkRenderedFile, endingDigest, needsVowelRelease } from "../src/services/ending-check";
import type { AudioManifest, EpisodeScript } from "../src/schema/script";
import { EpisodeScriptSchema } from "../src/schema/script";
import { readFile } from "node:fs/promises";

test("Korean declarative readings require evidence, including quoted endings", () => {
  assert.ok(needsVowelRelease('값을 건넵니다.”', 'ko'));
  assert.equal(needsVowelRelease("다음은?", "ko"), false);
  assert.equal(needsVowelRelease("Next.", "en"), false);
});

test("a changed reading or audio invalidates its digest, and a replaced export cannot pass", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "ending-test-"));
  try {
    const file = path.join(dir, "take");
    await writeFile(file, "first");
    const scene = { id: "check", type: "outro", heading: "끝", chapterTitle: "끝", narration: "건넵니다." } as const;
    const digest = await endingDigest(scene, file);
    assert.notEqual(digest, await endingDigest({ ...scene, narration: "남습니다." }, file));
    await writeFile(file, "second");
    assert.notEqual(digest, await endingDigest(scene, file));
    const manifest = {scenes:[{endingDigest:digest}]} as AudioManifest;
    await checkRenderedFile(file,manifest,true);
    await checkRenderedFile(file,manifest,false);
    await assert.rejects(checkRenderedFile(file,{scenes:[]} as unknown as AudioManifest,false));
    await writeFile(file,"different export");
    await assert.rejects(checkRenderedFile(file,manifest,false));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("production rejects a missing manifest and a clone scene without a release record", async () => {
  const script: EpisodeScript = EpisodeScriptSchema.parse(JSON.parse(await readFile("episodes/SE-0001/script.json", "utf8")));
  await assert.rejects(checkEndings(script,"long"), /타임라인/);
  await assert.rejects(checkEndings(script,"long",{provider:"qwen3-clone",scenes:[]} as unknown as AudioManifest), /다시 합성/);
});
