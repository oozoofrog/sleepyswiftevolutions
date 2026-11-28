import { checkKoreanCopy } from "../../src/lib/korean-copy";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { synthesizeQwenScenes } from "../../src/services/tts/qwen";
import { endingDigest } from "../../src/services/ending-check";
import type { Scene } from "../../src/schema/script";

const dir = path.dirname(fileURLToPath(import.meta.url));
const lines = (await readFile(path.join(dir, "narration.tsv"), "utf8")).trimEnd().split("\n").slice(1);
const scenes = lines.map((row) => {
  const [id, caption, reading] = row.split("\t");
  return {id, narration: caption, speech: [{language: "ko", text: reading || caption, caption}]} as Scene;
});
for (const scene of scenes) {
  for (const value of [scene.narration, ...(scene.speech ?? []).map(part => part.text)]) {
    const issue = checkKoreanCopy(value);
    if (issue) throw Error(scene.id + ": " + issue);
  }
}
const audio = path.join(dir, "audio/long");
const manifestPath = path.join(dir, "audio/manifest.json");
let previous: { key: string; digest: string; seconds: number; cues: unknown[]; openingLeadIn?: boolean }[] = [];
try {
  previous = JSON.parse(await readFile(manifestPath, "utf8"));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
const records = new Map(previous.map(record => [record.key, record]));
const missing: Scene[] = [];
for (const scene of scenes) {
  const file = path.join(audio, scene.id + ".mp3");
  const record = records.get(scene.id);
  if (!record || (scene.id === "intro" && !record.openingLeadIn) || record.digest !== await endingDigest(scene, file).catch(() => "")) {
    missing.push(scene);
  }
}
const verifyOnly = process.argv.includes("--check");
if (verifyOnly && missing.length) {
  throw Error("대본과 음성이 일치하지 않습니다. " + missing.map(scene => scene.id).join(", "));
}
// The archive study opens on "open". Both documentary cuts open on "intro".
for (const batch of [missing.filter(s => s.id === "intro"), missing.filter(s => s.id !== "intro")]) {
  if (!batch.length) continue;
  const opener = batch[0].id === "intro" ? "intro" : "open";
  const clips = await synthesizeQwenScenes(batch, audio, "qwen3-clone", undefined, opener);
  for (const [i, {result}] of clips.entries()) {
    const scene = batch[i];
    if (result.endingDigest !== await endingDigest(scene, result.audioPath)) throw Error(scene.id);
    records.set(scene.id, {key: scene.id, seconds: result.durationSec, cues: result.cues ?? [], digest: result.endingDigest, ...(scene.id === opener && {openingLeadIn: true})});
  }
}
if (!verifyOnly) await writeFile(manifestPath, JSON.stringify(scenes.map(scene => records.get(scene.id)), null, 2));
