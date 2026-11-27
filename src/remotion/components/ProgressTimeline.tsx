import React from "react";
import { useCurrentFrame } from "remotion";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import { FONT_SANS, THEME } from "../theme";

interface ProgressTimelineProps {
  scenes: ResolvedSceneTiming[];
  variant: "long" | "short";
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  scenes,
  variant,
}) => {
  const frame = useCurrentFrame();

  if (variant === "short") {
    return (
      <div
        style={{
          position: "absolute",
          top: 42,
          left: 44,
          right: 44,
          display: "flex",
          gap: 8,
          zIndex: 25,
        }}
      >
        {scenes.map((s) => {
          const localProgress = Math.max(
            0,
            Math.min(1, (frame - s.startFrame) / Math.max(1, s.durationInFrames)),
          );
          return (
            <div
              key={s.scene.id}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 999,
                backgroundColor: "rgba(148, 163, 184, 0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${localProgress * 100}%`,
                  height: "100%",
                  background: THEME.swiftGradient,
                  borderRadius: 999,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 34,
        left: 72,
        right: 72,
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        zIndex: 20,
      }}
    >
      {scenes.map((s) => {
        const isActive = frame >= s.startFrame && frame < s.startFrame + s.durationInFrames;
        const localProgress = Math.max(
          0,
          Math.min(1, (frame - s.startFrame) / Math.max(1, s.durationInFrames)),
        );

        return (
          <div
            key={s.scene.id}
            style={{
              flex: `${Math.max(1, s.durationInFrames)} 1 0px`,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 20,
                lineHeight: "24px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? THEME.textPrimary : THEME.textMuted,
                wordBreak: "keep-all",
                overflowWrap: "anywhere",
              }}
            >
              {s.scene.chapterTitle}
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 999,
                backgroundColor: "rgba(148, 163, 184, 0.22)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${localProgress * 100}%`,
                  height: "100%",
                  background: isActive ? THEME.swiftGradient : THEME.sky,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
