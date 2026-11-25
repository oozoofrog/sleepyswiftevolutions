export const SCENE_PADDING = {
  long: { leadInSec: 0.4, tailPadSec: 0.9 },
  short: { leadInSec: 0.35, tailPadSec: 0.75 },
};

export function sentencePauseSec(spoken: string): number {
  const end = spoken.trim().replace(/["'”’）)]+$/u, "");
  if (/[?？]$/u.test(end)) return 0.65;
  return /[.!。！]$/u.test(end) ? 0.45 : 0;
}
