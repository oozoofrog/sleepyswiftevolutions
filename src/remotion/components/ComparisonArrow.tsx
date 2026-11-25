import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

export const ComparisonArrow: React.FC<{ vertical?: boolean; endFrame: number }> = ({
  vertical = false,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, endFrame * 0.55, endFrame], [0, 0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateRight: "clamp",
  });
  return (
    <svg aria-hidden="true" width={52} height={52} viewBox="0 0 52 52"
      style={{ justifySelf: "center", alignSelf: "center", flexShrink: 0, transform: vertical ? "rotate(90deg)" : undefined }}>
      <path d="M4 26 H44 M31 13 L44 26 L31 39" pathLength={1} fill="none"
        stroke={THEME.swiftAmber} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={1} strokeDashoffset={1 - progress} />
    </svg>
  );
};
