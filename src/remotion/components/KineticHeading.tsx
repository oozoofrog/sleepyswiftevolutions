import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

/** Each word keeps its final layout while the ink rises and settles. */
export function KineticHeading({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/(\s+)/u);
  return <>{words.map((word, index) => {
    if (!word.trim()) return word;
    const start = Math.min(index / 2, 8) * fps * 0.035;
    const progress = interpolate(frame, [start, start + fps * 0.34], [0, 1], {
      easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    return <span key={index} style={{ display: "inline-block", verticalAlign: "bottom", overflow: "hidden", maxWidth: "100%" }}>
      <span style={{ display: "block", transform: `translateY(${(1 - progress) * 0.32}em)`,
        opacity: 0.55 + 0.45 * progress, color: progress < 0.65 ? THEME.swiftAmber : "inherit" }}>{word}</span>
    </span>;
  })}</>;
}
