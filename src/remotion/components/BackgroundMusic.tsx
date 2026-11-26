import React from "react";
import { Audio, interpolate, staticFile, useVideoConfig } from "remotion";

export function BackgroundMusic({ file }: { file: string }) {
  const { fps, durationInFrames } = useVideoConfig();
  const fade = Math.min(3 * fps, Math.floor(durationInFrames / 3));
  return <Audio src={staticFile(file)} loop volume={frame =>
    interpolate(frame, [0, fade, durationInFrames - fade, durationInFrames], [0, 0.26, 0.26, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  } loopVolumeCurveBehavior="extend" />;
}
