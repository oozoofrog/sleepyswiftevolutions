import type { Scene } from "../schema/script";

export const SCENE_PADDING = {
  long: { leadInSec: 0.4, tailPadSec: 0.9 },
  short: { leadInSec: 0.35, tailPadSec: 0.75 },
};

export function sentencePauseSec(spoken: string): number {
  const end = spoken.trim().replace(/["'”’）)]+$/u, "");
  if (/[?？]$/u.test(end)) return 0.65;
  if (/다[.!。！]$/u.test(end)) return 0.57;
  return /[.!。！]$/u.test(end) ? 0.45 : 0;
}

export function narrationSegments(scene: Scene) {
  const parts = scene.speech ?? [{ language: "ko", text: scene.narration, caption: scene.narration }];
  return parts.flatMap(part => {
    const split = /(?<=[.!?。！？])\s+/u;
    const captions = part.caption.split(split);
    const readings = part.text.split(split);
    if (captions.length !== readings.length || part.caption === scene.codeReveal?.answerCue) return [part];
    return readings.map((text, i) => ({ ...part, text, caption: captions[i] }));
  });
}
