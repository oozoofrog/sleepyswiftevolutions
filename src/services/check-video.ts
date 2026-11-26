import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";
import { z } from "zod";
import { getEpisodePaths, type VideoFormat } from "../lib/paths";
import { formatSrt } from "../lib/subtitle";
import { AudioManifestSchema } from "../schema/script";
import { getEffectiveShortsScenes, loadAndValidateScript } from "./script-generator";

const run = promisify(execFile);
const Probe = z.object({
  streams: z.array(z.object({
    codec_type: z.string(), width: z.number().optional(), height: z.number().optional(),
    duration: z.coerce.number().optional(),
  })),
});

export async function checkVideo(id: string, format: VideoFormat) {
  const paths = getEpisodePaths(id);
  const script = await loadAndValidateScript(id);
  const scenes = format === "long" ? script.scenes : getEffectiveShortsScenes(script);
  const manifest = AudioManifestSchema.parse(JSON.parse(await fs.readFile(paths.manifestPath(format), "utf8")));
  if (manifest.proposalId !== paths.id || manifest.format !== format || scenes.length !== manifest.scenes.length) {
    throw new Error("대본과 타임라인의 에피소드, 형식 또는 장면 수가 다릅니다.");
  }
  for (const [i, scene] of scenes.entries()) {
    const row = manifest.scenes[i];
    if (row.sceneId !== scene.id) throw new Error(`타임라인 장면 순서를 확인하세요: ${scene.id}`);
    const triggers = (scene.termNotes ?? []).map(note => note.cue);
    for (const person of scene.people ?? []) triggers.push(person.cue);
    for (const step of scene.codeSteps ?? []) {
      if (!scene.code?.code.includes(step.focus)) throw new Error(`강조할 코드가 없습니다: ${step.focus}`);
      triggers.push(step.cue);
    }
    if (scene.codeReveal) triggers.push(scene.codeReveal.answerCue);
    for (const trigger of triggers) {
      if (!row.cues.some(c => c.text.includes(trigger))) throw new Error(`${scene.id} 자막에 표시 시점이 없습니다: ${trigger}`);
    }
  }
  const srt = await fs.readFile(paths.subtitlesPath(format), "utf8");
  if (srt !== formatSrt(manifest.scenes.flatMap(s => s.cues))) throw new Error("SRT 자막과 타임라인이 다릅니다.");
  const file = paths.videoPath(format);
  const {stdout} = await run("ffprobe", ["-v", "error", "-show_streams", "-of", "json", file]);
  const {streams} = Probe.parse(JSON.parse(stdout));
  const video = streams.find(s => s.codec_type === "video");
  const audio = streams.find(s => s.codec_type === "audio");
  const [width, height] = format === "long" ? [1920, 1080] : [1080, 1920];
  if (video?.width !== width || video.height !== height || !audio) throw new Error(`해상도 또는 음성 트랙을 확인하세요: ${file}`);
  for (const stream of [video, audio]) {
    if (!stream.duration || Math.abs(stream.duration - manifest.totalDurationSec) > 2 / manifest.fps) {
      throw new Error(`타임라인과 트랙 길이가 다릅니다: ${stream.codec_type}`);
    }
  }
  const {stderr} = await run("ffmpeg", ["-nostats", "-hide_banner", "-xerror", "-i", file,
    "-map", "0:v:0", "-map", "0:a:0", "-af", "volumedetect", "-f", "null", "-"]);
  const peak = /max_volume:\s*([-\d.]+) dB/.exec(stderr);
  if (!peak || Number(peak[1]) < -80) throw new Error(`음성 신호를 확인하세요: ${file}`);
  return `${format} · ${width}×${height} · ${video.duration}초 · 최대 음량 ${peak[1]} dB`;
}
