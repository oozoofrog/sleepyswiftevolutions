import { SharedLayoutTransition } from "./SharedLayoutTransition";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export function sharedPanels(before?: ResolvedSceneTiming, after?: ResolvedSceneTiming) {
  const previousPanel = before?.scene.speech?.at(-1)?.direction?.panel;
  const nextPanel = after?.scene.speech?.[0]?.direction?.panel;
  if (previousPanel && nextPanel && before?.scene[previousPanel] && after?.scene[nextPanel] &&
      !before.scene.valueFlow && !after.scene.valueFlow) return { previousPanel, nextPanel };
}

export function SceneTransition({ children, frames, enabled, shared, continues }: {
  shared?: { previous: React.ReactNode; previousFrame: number; previousPanel: string; nextPanel: string };
  continues?: boolean;
  children: React.ReactNode; frames: number; enabled: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!enabled || frames < 4) return <>{children}</>;
  if (shared && frame < 1.25 * fps) {
    return <SharedLayoutTransition {...shared} progress={frame / (1.25 * fps)}>{children}</SharedLayoutTransition>;
  }
  const edge = Math.min(Math.round(0.45 * fps), Math.floor((frames - 1) / 3));
  const opacity = interpolate(Math.min(shared ? edge : frame, continues ? edge : frames - 1 - frame), [0, edge], [0, 1], {
    easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
}
