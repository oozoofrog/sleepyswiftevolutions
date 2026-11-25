import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import type { Scene } from "../../schema/script";
import { tokenizeSwift } from "../../lib/swift-highlight";
import { KineticHeading } from "./KineticHeading";
import { FONT_MONO, FONT_SANS, SYNTAX_COLORS, THEME } from "../theme";

export function CodeReveal({ timing, reveal }: {
  timing: ResolvedSceneTiming;
  reveal: NonNullable<Scene["codeReveal"]>;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cue = timing.cues.find(c => c.text.includes(reveal.answerCue));
  // Estimated or imported captions can include the end of the preceding phrase.
  const cueOffset = cue ? (cue.endSec - cue.startSec) * cue.text.indexOf(reveal.answerCue) / cue.text.length : 0;
  const revealFrame = cue ? Math.round((cue.startSec + cueOffset - timing.startSec) * fps)
    : Math.round(timing.durationInFrames * 0.72);
  const opacity = interpolate(frame, [revealFrame - 1, revealFrame + 2], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const count = reveal.parts.reduce((n, p) => n + Array.from(typeof p === "string" ? p : p.remove).length, 0);
  const glyphs = React.useMemo(() => {
    const chars = reveal.parts.flatMap(part => Array.from(typeof part === "string" ? part : part.remove,
      char => ({ char, removed: typeof part !== "string" })));
    const colors = (code: string) => tokenizeSwift(code).flatMap((line, i) => [
      ...(i ? [THEME.textPrimary] : []),
      ...line.flatMap(token => Array.from(token.text, () => SYNTAX_COLORS[token.kind])),
    ]);
    const before = colors(chars.map(c => c.char).join(""));
    const after = colors(chars.filter(c => !c.removed).map(c => c.char).join(""));
    let retained = 0;
    return chars.map((c, i) => ({ ...c, before: before[i], after: c.removed ? before[i] : after[retained++] }));
  }, [reveal.parts]);
  const portrait = height > width;
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50, padding: "0 6%" }}>
    {timing.scene.badge && <div style={{ fontFamily: FONT_SANS, fontSize: portrait ? 30 : 28,
      color: THEME.textSecondary, textAlign: "center" }}>{timing.scene.badge}</div>}
    <div style={{ font: `600 ${portrait ? 58 : 66}px ${FONT_SANS}`, color: THEME.textPrimary,
      textAlign: "center", wordBreak: "keep-all", maxWidth: portrait ? 820 : 1600 }}><KineticHeading text={timing.scene.heading} /></div>
    <div style={{ fontFamily: FONT_MONO, fontSize: Math.min(portrait ? 64 : 94, width * 0.78 / (count * 0.62)),
      background: THEME.codeSurface, border: `1px solid ${THEME.borderSubtle}`,
      boxShadow: "0 22px 60px rgba(0,0,0,0.32)", borderRadius: 24,
      padding: portrait ? "32px 28px" : "40px 52px",
      whiteSpace: "pre", fontWeight: 600 }}>
      {glyphs.map((g, i) => <span key={i} style={{
        opacity: g.removed ? opacity : 1,
        color: g.removed && frame >= revealFrame - fps * 0.65 ? THEME.swiftOrange :
          frame >= revealFrame ? g.after : g.before,
      }}>{g.char}</span>)}
    </div>
  </AbsoluteFill>;
}
