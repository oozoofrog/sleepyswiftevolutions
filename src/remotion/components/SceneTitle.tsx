import { KineticHeading } from "./KineticHeading";
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_SANS, THEME } from "../theme";

interface SceneTitleProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  compact?: boolean;
  align?: "left" | "center";
}

export const SceneTitle: React.FC<SceneTitleProps> = ({
  eyebrow,
  heading,
  subheading,
  compact = false,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 140, mass: 0.7 },
  });
  const translateY = interpolate(progress, [0, 1], [16, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 12,
        textAlign: align,
        alignItems: align === "center" ? "center" : "flex-start",
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      {eyebrow && (
        <span
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 700,
            fontSize: compact ? 20 : 22,
            color: THEME.swiftAmber,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
      )}
      <h1
        style={{
          margin: 0,
          fontFamily: FONT_SANS,
          fontWeight: 800,
          fontSize: compact ? 46 : 54,
          lineHeight: 1.2,
          color: THEME.textPrimary,
          letterSpacing: "-0.02em",
          wordBreak: "keep-all",
        }}
      >
        <KineticHeading text={heading} />
      </h1>
      {subheading && (
        <p
          style={{
            margin: 0,
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: compact ? 24 : 26,
            lineHeight: 1.4,
            color: THEME.textSecondary,
            wordBreak: "keep-all",
          }}
        >
          {subheading}
        </p>
      )}
    </div>
  );
};
