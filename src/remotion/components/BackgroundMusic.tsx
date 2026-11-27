import React from "react";
import { Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import type { EpisodeScript, SubtitleCue } from "../../schema/script";

export function BackgroundMusic({ music, cues }: {
  music: NonNullable<EpisodeScript["backgroundMusic"]>;
  cues: SubtitleCue[];
}) {
  const { fps, durationInFrames } = useVideoConfig();
  const duck = typeof music === "object" && music.duckUnderNarration;
  const file = typeof music === "string" ? music : music.file;
  const fadeIn = Math.min((duck ? 0.36 : 3) * fps, durationInFrames / 3);
  const fadeOut = Math.min(3 * fps, durationInFrames / 3);
  return <Audio src={staticFile(file)} loop loopVolumeCurveBehavior="extend" volume={frame => {
    const envelope = interpolate(frame, [0, fadeIn, durationInFrames - fadeOut, durationInFrames], [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (!duck) return 0.26 * envelope;

    const time = frame / fps;
    let gain = 0.26;
    for (const cue of cues) {
      if (time < cue.startSec - 0.18) break;
      if (time >= cue.endSec + 0.55) continue;
      const cueGain = interpolate(time, [cue.startSec - 0.18, cue.startSec, cue.endSec, cue.endSec + 0.55],
        [0.26, 0.17, 0.17, 0.26]);
      gain = Math.min(gain, cueGain);
    }
    return gain * envelope;
  }}/>;
}
