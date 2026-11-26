import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import type { CodeSnippet, Scene } from "../../schema/script";
import { FONT_MONO, FONT_SANS, THEME } from "../theme";
import { CodePanel } from "./CodePanel";
import { SceneTitle } from "./SceneTitle";

function progress(now: number, start: number, duration: number) {
  return interpolate(now, [start, start + duration], [0, 1], {
    easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
}

function ValueSlot({ label, name, visibility, change }: {
  label: string; name: string; visibility: number; change: number;
}) {
  return <div style={{ textAlign: "center", width: 134, zIndex: 1 }}>
    <div style={{ font: `500 29px ${FONT_SANS}`, color: THEME.textSecondary, whiteSpace: "nowrap", display: "flex", justifyContent: "center" }}>{label} · {name}</div>
    <div style={{ marginTop: 18, background: THEME.bgNavy, border: `2px solid ${THEME.borderHighlight}`,
      borderRadius: 24, width: 130, height: 100, overflow: "hidden", position: "relative",
      font: `600 64px/100px ${FONT_MONO}`, color: THEME.swiftAmber }}>
      <div style={{ opacity: visibility, transform: `translateY(${-100 * change}px)` }}>1</div>
      <div style={{ opacity: visibility, transform: `translateY(${-100 * change}px)` }}>2</div>
    </div>
  </div>;
}

export function ParameterValueFlow({ timing, flow, snippet }: {
  timing: ResolvedSceneTiming; flow: NonNullable<Scene["valueFlow"]>; snippet: CodeSnippet;
}) {
  const { fps, width, height } = useVideoConfig();
  const now = useCurrentFrame() / fps;
  const duration = timing.durationInFrames / fps;
  const cueStart = (phrase: string, fallback: number) => {
    const cue = timing.cues.find(item => item.text.includes(phrase));
    return cue ? cue.startSec - timing.startSec : fallback;
  };
  const assignment = cueStart(flow.mutateCue, duration * 0.43);
  const finish = cueStart(flow.returnCue, duration * 0.74);
  const clone = progress(now, 0.18, Math.min(0.95, Math.max(0.1, assignment - 0.22)));
  const mutate = progress(now, assignment, 0.5);
  const leave = progress(now, finish, 0.9);
  const writingBack = flow.mode === "inout";
  const movingBack = now >= finish && writingBack;
  const travel = movingBack ? 1 - leave : clone;
  const tokenOpacity = travel > 0 && travel < 1 ? Math.sin(Math.PI * travel) : 0;
  const portrait = height > width;
  return <AbsoluteFill style={{ justifyContent: "center", gap: 32, padding: portrait ? "0 7%" : "0 14%" }}>
    <SceneTitle eyebrow={timing.scene.badge} heading={timing.scene.heading} />
    <CodePanel snippet={snippet} fontSize={portrait ? 33 : 42} animate={false}/>
    <div style={{ position: "relative", alignSelf: "center", width: "88%", marginTop: 16, display: "flex",
      justifyContent: "space-between" }}>
      <div style={{ position: "absolute", bottom: 50, left: 66, right: 66, borderTop: `2px solid ${THEME.borderSubtle}` }} />
      <ValueSlot name="x" label="호출한 곳" visibility={1} change={writingBack ? progress(leave, 0.84, 0.16) : 0}/>
      <ValueSlot name="i" label="함수 안" visibility={clone * (1 - leave)} change={mutate}/>
      <div style={{ position: "absolute", bottom: 50, left: 66, right: 66, zIndex: 2 }}>
        <div style={{ position: "absolute", left: `${travel * 100}%`, transform: "translate(-50%, -50%)",
          borderRadius: 50, width: 68, height: 68, backgroundColor: THEME.swiftAmber, color: THEME.bgDeep,
          textAlign: "center", font: `600 40px/68px ${FONT_MONO}`, opacity: tokenOpacity }}>
          {movingBack ? "2" : "1"}
        </div>
      </div>
    </div>
  </AbsoluteFill>;
}
