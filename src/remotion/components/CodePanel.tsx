import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { tokenizeSwift } from "../../lib/swift-highlight";
import type { CodeSnippet } from "../../schema/script";
import { FONT_MONO, FONT_SANS, SYNTAX_COLORS, THEME } from "../theme";

interface CodePanelProps {
  snippet: CodeSnippet;
  tone?: "neutral" | "before" | "after";
  fontSize?: number;
  delayFrames?: number;
  animate?: boolean;
  style?: React.CSSProperties;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  snippet,
  tone = "neutral",
  fontSize = 23,
  delayFrames = 4,
  animate = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = animate
    ? spring({
        frame: Math.max(0, frame - delayFrames),
        fps,
        config: { damping: 18, stiffness: 130, mass: 0.8 },
      })
    : 1;

  const translateY = animate ? interpolate(enter, [0, 1], [18, 0]) : 0;
  const opacity = animate ? interpolate(enter, [0, 1], [0, 1]) : 1;

  const tokenLines = React.useMemo(() => tokenizeSwift(snippet.code), [snippet.code]);
  const highlightSet = new Set(snippet.highlightLines ?? []);
  const addedSet = new Set(snippet.diffAddedLines ?? []);
  const removedSet = new Set(snippet.diffRemovedLines ?? []);

  const borderColor =
    tone === "before"
      ? THEME.roseBorder
      : tone === "after"
        ? THEME.emeraldBorder
        : THEME.borderSubtle;

  const badgeBg =
    tone === "before"
      ? THEME.roseBg
      : tone === "after"
        ? THEME.emeraldBg
        : "rgba(148, 163, 184, 0.14)";

  const badgeColor =
    tone === "before"
      ? THEME.rose
      : tone === "after"
        ? THEME.emerald
        : THEME.textSecondary;

  const lineHeight = Math.round(fontSize * 1.56);

  return (
    <div
      style={{
        background: THEME.codeSurface,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
        transform: `translateY(${translateY}px)`,
        opacity,
        ...style,
      }}
    >
      {/* Window Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: THEME.bgCodeHeader,
          borderBottom: `1px solid ${THEME.borderSubtle}`,
          padding: "14px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F56" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27C93F" }} />
          </div>
          {snippet.filename && (
            <span
              style={{
                marginLeft: 10,
                fontFamily: FONT_MONO,
                fontSize: Math.max(15, fontSize - 6),
                color: THEME.textMuted,
              }}
            >
              {snippet.filename}
            </span>
          )}
        </div>

        {snippet.label && (
          <span
            style={{
              backgroundColor: badgeBg,
              color: badgeColor,
              border: `1px solid ${borderColor}`,
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: Math.max(15, fontSize - 5),
              padding: "4px 12px",
              borderRadius: 999,
            }}
          >
            {snippet.label}
          </span>
        )}
      </div>

      {/* Code Lines */}
      <div
        style={{
          padding: "20px 22px",
          fontFamily: FONT_MONO,
          fontSize,
          lineHeight: `${lineHeight}px`,
        }}
      >
        {tokenLines.map((tokens, idx) => {
          const lineNumber = idx + 1;
          const isHighlighted = highlightSet.has(lineNumber);
          const isAdded = addedSet.has(lineNumber);
          const isRemoved = removedSet.has(lineNumber);

          const lineAnim = animate
            ? interpolate(frame, [delayFrames + idx * 2, delayFrames + idx * 2 + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;

          let rowBg = "transparent";
          let rowBorderLeft = "3px solid transparent";
          let gutterMarker = "";
          let gutterColor: string = THEME.textMuted;

          if (isRemoved) {
            rowBg = THEME.roseBg;
            rowBorderLeft = `3px solid ${THEME.rose}`;
            gutterMarker = "-";
            gutterColor = THEME.rose;
          } else if (isAdded) {
            rowBg = THEME.emeraldBg;
            rowBorderLeft = `3px solid ${THEME.emerald}`;
            gutterMarker = "+";
            gutterColor = THEME.emerald;
          } else if (isHighlighted) {
            rowBg = "rgba(240, 81, 56, 0.12)";
            rowBorderLeft = `3px solid ${THEME.swiftOrange}`;
          }

          // Sweep over the annotated code after the panel settles, then hold.
          const focusStart = delayFrames + 8 + idx * 2;
          const focus = animate ? interpolate(frame, [focusStart, focusStart + 14], [0, 100], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          }) : 100;

          return (
            <div
              key={lineNumber}
              style={{
                display: "flex",
                alignItems: "flex-start",
                backgroundImage: `linear-gradient(90deg, ${rowBg} ${focus}%, transparent ${focus}%)`,
                borderLeft: rowBorderLeft,
                borderRadius: 6,
                padding: "2px 10px",
                marginBottom: 2,
                opacity: lineAnim,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <span
                style={{
                  width: 34,
                  flexShrink: 0,
                  userSelect: "none",
                  color: gutterColor,
                  fontSize: Math.max(14, fontSize - 6),
                  opacity: gutterMarker ? 1 : 0.45,
                  fontWeight: gutterMarker ? 700 : 400,
                }}
              >
                {gutterMarker || lineNumber}
              </span>
              <span style={{ flex: 1 }}>
                {tokens.length === 0 ? (
                  " "
                ) : (
                  tokens.map((tok, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        color: SYNTAX_COLORS[tok.kind],
                        backgroundColor:
                          tok.kind === "backtick" ? "rgba(251, 191, 36, 0.16)" : "transparent",
                        borderRadius: tok.kind === "backtick" ? 4 : 0,
                        padding: tok.kind === "backtick" ? "0 3px" : 0,
                        fontWeight: tok.kind === "keyword" || tok.kind === "backtick" ? 700 : 400,
                      }}
                    >
                      {tok.text}
                    </span>
                  ))
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
