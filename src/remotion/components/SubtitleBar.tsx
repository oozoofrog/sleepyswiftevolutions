import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { SubtitleCue } from "../../schema/script";
import { FONT_SANS, THEME } from "../theme";

interface SubtitleBarProps {
  cues: SubtitleCue[];
  variant: "long" | "short";
}

export const SubtitleBar: React.FC<SubtitleBarProps> = ({ cues, variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeSec = frame / fps;

  const activeCue = cues.find(
    (cue) => currentTimeSec >= cue.startSec - 0.03 && currentTimeSec <= cue.endSec + 0.08,
  );

  if (!activeCue) return null;

  const cueAgeFrames = Math.max(0, (currentTimeSec - activeCue.startSec) * fps);
  const fade = interpolate(cueAgeFrames, [0, 4], [0, 1], { extrapolateRight: "clamp" });

  const isShort = variant === "short";

  return (
    <div
      style={{
        position: "absolute",
        left: isShort ? 56 : 120,
        right: isShort ? 56 : 120,
        // Keep Shorts subtitles safely above YouTube Shorts' bottom 280px UI overlay
        bottom: isShort ? 310 : 72,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: fade,
        zIndex: 30,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(7, 11, 20, 0.88)",
          border: `1.5px solid ${THEME.borderSubtle}`,
          boxShadow: "0 14px 40px rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
          padding: isShort ? "16px 26px" : "12px 26px",
          maxWidth: isShort ? 940 : 1480,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 700,
            fontSize: isShort ? 38 : 28,
            lineHeight: 1.38,
            color: THEME.textPrimary,
            textShadow: "0 2px 6px rgba(0,0,0,0.6)",
            wordBreak: "keep-all",
          }}
        >
          {activeCue.text}
        </span>
      </div>
    </div>
  );
};
