import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { tokenizeSwift, type SwiftToken } from "../../lib/swift-highlight";
import type { CodeSnippet, CodeTarget } from "../../schema/script";
import { FONT_MONO, FONT_SANS, SYNTAX_COLORS, THEME } from "../theme";

interface PinpointFocus {
  targets: CodeTarget[];
  repeated?: ReadonlySet<CodeTarget>;
  opacity: number;
  pulse: number;
}

interface CodePanelProps {
  snippet: CodeSnippet;
  tone?: "neutral" | "before" | "after";
  fontSize?: number;
  delayFrames?: number;
  animate?: boolean;
  hideGlyphs?: boolean;
  pinpoint?: PinpointFocus;
  lineBand?: { previousLines: number[]; progress: number; opacity?: number };
  wordFocus?: { text: string; progress: number; opacity: number };
  style?: React.CSSProperties;
}

function renderTokens(tokens: SwiftToken[], hideGlyphs: boolean) {
  return tokens.map((tok, tIdx) => (
    <span
      data-code-token=""
      key={tIdx}
      style={{
        visibility: hideGlyphs ? "hidden" : undefined,
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
  ));
}

function renderCodeLine(tokens: SwiftToken[], hideGlyphs: boolean, focus: PinpointFocus | undefined, line: number) {
  const target = focus?.targets.find(item => item.line === line);
  if (!target || !focus) return renderTokens(tokens, hideGlyphs);
  const start = tokens.map(token => token.text).join("").indexOf(target.text);
  if (start < 0) return renderTokens(tokens, hideGlyphs);
  const end = start + target.text.length;
  const groups: SwiftToken[][] = [[], [], []];
  let column = 0;
  for (const token of tokens) {
    const from = Math.max(0, start - column);
    const to = Math.max(0, end - column);
    const pieces = [token.text.slice(0, from), token.text.slice(from, to), token.text.slice(to)];
    pieces.forEach((text, i) => { if (text) groups[i].push({ ...token, text }); });
    column += token.text.length;
  }
  const repeated = focus.repeated?.has(target);
  const scale = 1 + 0.08 * focus.pulse;
  return <>{renderTokens(groups[0], hideGlyphs)}<span style={{
    display: "inline-block", position: "relative", isolation: "isolate",
    transform: repeated ? `scale(${scale})` : undefined,
    marginInline: repeated ? `${(scale - 1) * target.text.length / 2}ch` : undefined,
  }}>
    {!repeated && <span aria-hidden style={{
      position: "absolute", inset: "0.23em -0.07em", zIndex: -1,
      borderRadius: "0.14em", background: "rgba(240,149,83,.35)", opacity: focus.opacity,
    }}/>}
    {renderTokens(groups[1], hideGlyphs)}
  </span>{renderTokens(groups[2], hideGlyphs)}</>;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  snippet,
  tone = "neutral",
  fontSize = 23,
  delayFrames = 4,
  animate = true,
  hideGlyphs = false,
  pinpoint,
  wordFocus,
  lineBand,
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
    <div className="code-panel"
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
          const wordColumn = wordFocus ? tokens.map(token => token.text).join("").indexOf(wordFocus.text) : -1;
          const focusWord = wordColumn >= 0 && !addedSet.has(lineNumber) && !removedSet.has(lineNumber) ? wordFocus : undefined;
          const isHighlighted = highlightSet.has(lineNumber);
          const isAdded = addedSet.has(lineNumber);
          const isRemoved = removedSet.has(lineNumber);

          const wasHighlighted = lineBand?.previousLines.includes(lineNumber) ?? false;
          const showBand = lineBand && !isAdded && !isRemoved && (isHighlighted || (wasHighlighted && lineBand.progress < 1));
          const reveal = showBand && !wasHighlighted ? lineBand.progress : 1;
          const strength = (focusWord?.opacity ?? (showBand && !isHighlighted ? 1 - lineBand.progress : 1)) * (lineBand?.opacity ?? 1);
          const narrow = focusWord?.progress ?? 0;

          const gutterFocus = lineBand && (showBand || focusWord) ? strength * (1 - narrow) * reveal : 0;

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
          } else if (isHighlighted && !focusWord && !showBand) {
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
                position: "relative",
                isolation: "isolate",
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
              {(showBand || focusWord) && <span aria-hidden style={{
                position: "absolute", zIndex: -1, insetBlock: 0, borderRadius: 6,
                // The code starts after the 10px row padding and 34px line-number gutter.
                left: `calc(${40 * narrow}px + ${wordColumn * narrow}ch)`,
                right: `calc(${100 * narrow}% - ${48 * narrow}px - ${(wordColumn + (focusWord?.text.length ?? 0)) * narrow}ch)`,
                opacity: strength,
                background: lineBand
                  ? "linear-gradient(90deg, rgba(240,149,83,.34), rgba(240,149,83,.22))"
                  : "rgba(236,128,63,.34)",
                boxShadow: lineBand ? `inset 0 0 0 1.5px rgba(255,190,133,.50), inset ${4 * (1 - narrow)}px 0 0 #ffae72` : undefined,
                clipPath: reveal < 1 && !focusWord ? `inset(0 ${100 * (1 - reveal)}% 0 0 round 6px)` : undefined,
              }}/>}
              <span
                style={{
                  width: 34,
                  flexShrink: 0,
                  userSelect: "none",
                  color: gutterFocus > 0 ? "#ffe0bd" : gutterColor,
                  fontSize: Math.max(14, fontSize - 6),
                  opacity: gutterMarker ? 1 : 0.45 + 0.55 * gutterFocus,
                  fontWeight: gutterMarker ? 700 : 400,
                }}
              >
                {gutterMarker || lineNumber}
              </span>
              <span style={{ flex: 1 }}>
                {tokens.length === 0 ? (
                  " "
                ) : (
                  renderCodeLine(tokens, hideGlyphs, pinpoint, lineNumber)
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
