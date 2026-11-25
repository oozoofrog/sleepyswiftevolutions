import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../schema/script";
import { SceneTitle } from "./SceneTitle";
import { FONT_MONO, FONT_SANS, THEME } from "../theme";

export function ProposalHistory({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return <AbsoluteFill style={{ justifyContent: "center", padding: portrait ? "0 7% 8%" : "0 9%", gap: portrait ? 48 : 70 }}>
    <SceneTitle heading={scene.heading} eyebrow={scene.chapterTitle} />
    <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", gap: portrait ? 24 : 36 }}>
      {scene.milestones?.map(({ date, event }, i) => {
        const progress = interpolate(frame, [i * 5, i * 5 + 10], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return <div key={i} style={{ flex: 1, borderTop: `3px solid ${THEME.swiftOrange}`,
          padding: "20px 0", color: THEME.textPrimary, opacity: progress,
          transform: `translateY(${12 * (1 - progress)}px)` }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: portrait ? 48 : 54, fontWeight: 700 }}>{date.trim()}</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 32, marginTop: 8, color: THEME.textSecondary }}>{event}</div>
        </div>;
      })}
    </div>
  </AbsoluteFill>;
}
