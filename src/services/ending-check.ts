import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { narrationSegments } from "../lib/pacing";
import { getEffectiveShortsScenes } from "../lib/timeline";
import { getEpisodePaths, type VideoFormat } from "../lib/paths";
import { writeJsonAtomic } from "../lib/state";
import type { AudioManifest, EpisodeScript, Scene } from "../schema/script";

export function needsVowelRelease(text: string, language: string) {
  return language === "ko" && /다[.!。！]["'”’）)]*$/u.test(text.trim());
}

export async function endingDigest(scene: Scene, audio: string) {
  return createHash("sha256").update("aligned-vowel-v1\0")
    .update(JSON.stringify(narrationSegments(scene).map(p => [p.language, p.text, p.caption])))
    .update(await fs.readFile(audio)).digest("hex");
}

export async function checkEndings(script: EpisodeScript, format: VideoFormat, manifest?: AudioManifest) {
  const scenes = format === "long" ? script.scenes : getEffectiveShortsScenes(script);
  const required = scenes.filter(scene => narrationSegments(scene).some(p => needsVowelRelease(p.text, p.language)));
  if (!required.length) return false;
  if (!manifest) throw Error("말끝을 확인할 음성 타임라인이 없습니다. 먼저 음성을 합성하세요.");
  if (manifest.provider !== "qwen3-clone") return false;
  const { audioDir } = getEpisodePaths(script.proposalId);
  for (const scene of required) {
    const row = manifest.scenes.find(item => item.sceneId === scene.id);
    if (!row?.endingDigest || row.endingDigest !== await endingDigest(scene, path.join(audioDir, row.audioFile))) {
      throw Error(scene.id + "의 대본·음성과 승인 말끝 처리 기록이 일치하지 않습니다. 이 장면을 다시 합성하세요.");
    }
  }
  return true;
}

export async function checkRenderedFile(video: string, manifest: AudioManifest, record: boolean) {
  const receipt = video + ".endings.json";
  const hash = createHash("sha256").update(JSON.stringify(manifest.scenes.map(s => s.endingDigest ?? null)));
  for await (const chunk of createReadStream(video)) hash.update(chunk);
  const digest = hash.digest("hex");
  if (record) await writeJsonAtomic(receipt, { digest });
  else {
    const saved = await fs.readFile(receipt, "utf8").catch(() => "{}");
    if (JSON.parse(saved).digest !== digest) throw Error("영상 파일과 말끝 검증 기록이 일치하지 않습니다. 다시 렌더하세요.");
  }
}
