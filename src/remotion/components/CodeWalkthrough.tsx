import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import { tokenizeSwift } from "../../lib/swift-highlight";
import type { CodeSnippet, Scene } from "../../schema/script";
import { FONT_MONO, FONT_SANS, SYNTAX_COLORS, THEME } from "../theme";
import { SceneTitle } from "./SceneTitle";

function colored(text: string) {
  return tokenizeSwift(text).map((line, i) => <React.Fragment key={i}>
    {i > 0 && "\n"}{line.map((token, j) => <span key={j} style={{color: SYNTAX_COLORS[token.kind]}}>{token.text}</span>)}
  </React.Fragment>);
}

export function CodeWalkthrough({ timing, snippet, steps }: {
  timing: ResolvedSceneTiming;
  snippet: CodeSnippet;
  steps: NonNullable<Scene["codeSteps"]>;
}) {
  const {fps, width, height} = useVideoConfig();
  const now = useCurrentFrame() / fps + timing.startSec;
  const portrait = height > width;
  const starts = steps.map(step => timing.cues.find(c => c.text.includes(step.cue))?.startSec ?? Infinity);
  const active = steps.filter((_, i) => starts[i] <= now).at(-1);
  const offset = active ? snippet.code.indexOf(active.focus) : -1;
  return <AbsoluteFill style={{justifyContent: "center", padding: portrait ? "0 6%" : "0 12%", gap: 32, color: THEME.textPrimary}}>
    <SceneTitle eyebrow={timing.scene.badge} heading={timing.scene.heading} />
    <div className="code-panel" style={{padding: 32, borderRadius: 24, background: THEME.codeSurface}}>
      <div style={{font: `600 25px ${FONT_SANS}`, color: THEME.swiftAmber}}>{snippet.label}</div>
      <pre style={{font: `500 ${portrait ? 39 : 52}px/1.45 ${FONT_MONO}`, margin: "20px 0 0"}}>{offset >= 0 && active
        ? <>{colored(snippet.code.slice(0, offset))}<span style={{borderBottom: `4px solid ${THEME.swiftOrange}`, background: THEME.amberBg}}>{colored(active.focus)}</span>{colored(snippet.code.slice(offset + active.focus.length))}</>
        : colored(snippet.code)}</pre>
    </div>
    <div style={{paddingLeft: 32, font: `500 ${portrait ? 40 : 49}px/1.45 ${FONT_MONO}`, whiteSpace: "pre"}}>
      {steps.map((step, i) => <div key={step.cue} style={{opacity: now < starts[i] ? 0 :
        interpolate(now - starts[i], [0, 0.25], [0, 1], {extrapolateRight: "clamp"})}}>{colored(step.example)}</div>)}
    </div>
  </AbsoluteFill>;
}
