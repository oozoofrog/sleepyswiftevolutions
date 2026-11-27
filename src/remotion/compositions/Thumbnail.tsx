import React from "react";
import { AbsoluteFill } from "remotion";
import type { EpisodeScript } from "../../schema/script";
import { CodePanel } from "../components/CodePanel";
import { FONT_LABEL, FONT_SANS, stageBackground, THEME } from "../theme";

export interface ThumbnailProps {
  script: EpisodeScript;
  variant: "long" | "short";
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ script, variant }) => {
  const { thumbnail } = script;
  const isShort = variant === "short";
  const accent = thumbnail.accentColor || THEME.swiftOrange;

  return (
    <AbsoluteFill className={script.visualStyle}
      style={{
        backgroundColor: THEME.bgDeep,
        backgroundImage: stageBackground(accent),
        padding: isShort ? "110px 64px" : "58px 68px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* Top accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: THEME.swiftGradient,
        }}
      />

      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              background: THEME.swiftGradient,
              color: THEME.bgDeep,
              fontFamily: FONT_LABEL,
              fontWeight: 900,
              fontSize: isShort ? 36 : 34,
              padding: "10px 24px",
              borderRadius: 16,
              boxShadow: `0 12px 32px ${accent}55`,
            }}
          >
            {script.proposalId}
          </span>
          <span
            style={{
              fontFamily: FONT_LABEL,
              fontWeight: 700,
              fontSize: isShort ? 26 : 24,
              color: THEME.sky,
              backgroundColor: THEME.skyBg,
              border: `1.5px solid ${THEME.skyBorder}`,
              padding: "10px 20px",
              borderRadius: 16,
            }}
          >
            {thumbnail.eyebrow}
          </span>
        </div>

        {!isShort && (
          <span
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 22,
              color: THEME.textMuted,
            }}
          >
            Swift Evolution 해설
          </span>
        )}
      </div>

      {/* Main Headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_SANS,
            fontWeight: 900,
            fontSize: isShort ? 82 : 76,
            lineHeight: 1.15,
            color: THEME.textPrimary,
            whiteSpace: "pre-line",
            letterSpacing: "-0.03em",
            textShadow: "0 8px 30px rgba(0, 0, 0, 0.65)",
            wordBreak: "keep-all",
          }}
        >
          {thumbnail.headline}
        </h1>
        {thumbnail.subheadline && (
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: isShort ? 28 : 25,
              color: THEME.textSecondary,
              opacity: 0.9,
            }}
          >
            {thumbnail.subheadline}
          </div>
        )}
      </div>

      {/* Before / After Code Comparison */}
      {(thumbnail.codeBefore || thumbnail.codeAfter) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isShort ? "1fr" : "1fr 1fr",
            gap: isShort ? 22 : 24,
          }}
        >
          {thumbnail.codeBefore && (
            <CodePanel
              snippet={{
                label: "BEFORE",
                code: thumbnail.codeBefore,
                diffRemovedLines: [1],
              }}
              tone="before"
              fontSize={isShort ? 30 : 25}
              animate={false}
            />
          )}
          {thumbnail.codeAfter && (
            <CodePanel
              snippet={{
                label: `AFTER · Swift ${script.swiftVersion}`,
                code: thumbnail.codeAfter,
                diffAddedLines: [1],
              }}
              tone="after"
              fontSize={isShort ? 30 : 25}
              animate={false}
            />
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
