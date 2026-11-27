import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import { FONT_SANS, THEME } from "../theme";
import { CodeGlyphMorph } from "./CodeGlyphMorph";
import { CodePanel } from "./CodePanel";
import { PathDrawing } from "./PathDrawing";
import { ParameterValueFlow } from "./ParameterValueFlow";
import { SceneTitle } from "./SceneTitle";

export function DirectedScene({ timing, preceding, showStageLabels = true, animateLineHighlight = false, sharedLayout = false }: { timing: ResolvedSceneTiming; preceding?: ResolvedSceneTiming["scene"]; showStageLabels?: boolean; animateLineHighlight?: boolean; sharedLayout?: boolean }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;
  const { scene } = timing;
  const now = (timing.startFrame + frame) / fps;
  const cue = timing.cues.filter(item => item.startSec <= now).at(-1) ?? timing.cues[0];
  const cueIndex = timing.cues.indexOf(cue);
  // One scripted beat may span multiple sentence-level subtitle cues.
  const directionAt = (length: number) => {
    let end = 0;
    return scene.speech?.find(part => {
      end += part.caption.replace(/\s/gu, "").length;
      return length < end;
    })?.direction;
  };
  const spokenLength = timing.cues.slice(0, Math.max(0, cueIndex))
    .reduce((n, item) => n + item.text.replace(/\s/gu, "").length, 0);
  const beat = directionAt(spokenLength);
  const previous = cueIndex > 0
    ? directionAt(spokenLength - timing.cues[cueIndex - 1].text.replace(/\s/gu, "").length)
    : undefined;
  const localFrame = cue ? frame - Math.round((cue.startSec - timing.startSec) * fps) : 0;
  const refs = beat?.references;
  // Reference offsets start at the first cue in the scripted speech, even if its caption was split.
  let speechStart = cue?.startSec ?? now;
  let length = spokenLength;
  for (let i = cueIndex - 1; refs && i >= 0; i--) {
    length -= timing.cues[i].text.replace(/\s/gu, "").length;
    if (directionAt(length) !== beat) break;
    speechStart = timing.cues[i].startSec;
  }
  const refIndex = refs && cue && now >= cue.startSec && now < cue.endSec
    ? refs.filter(ref => now >= speechStart + ref.offsetSec).length - 1 : -1;
  const ref = refs && refIndex >= 0 ? refs[refIndex] : undefined;
  const priorRef = refs && refIndex > 0 ? refs[refIndex - 1] : undefined;
  const refAge = ref ? now - speechStart - ref.offsetSec : 0;
  const targetPanel = ref?.panel ?? beat?.panel;
  const selectedLines = ref?.targets ? [] : refs ? ref?.lines ?? [] : beat?.lines;
  const refWindow = ref ? Math.max(0.1, Math.min(cue.endSec - speechStart,
    refs?.[refIndex + 1]?.offsetSec ?? Infinity) - ref.offsetSec) : Infinity;
  const lineSeconds = Math.min(0.95, refWindow * 0.65);
  const lineBand = (panel: "code" | "codeBefore" | "codeAfter" | undefined) => animateLineHighlight ? {
    previousLines: refs
      ? priorRef && (priorRef.panel ?? beat?.panel) === panel ? priorRef.lines : []
      : previous && previous.panel === panel ? previous.lines ?? [] : [],
    progress: interpolate(refs ? refAge * fps : cueIndex > 0 ? localFrame : frame, [0, fps * lineSeconds], [0, 1], {
      easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }),
    opacity: ref ? Math.min(1, Math.max(0, (cue.endSec - now) / 0.32)) : 1,
  } : undefined;
  const snippet = beat?.panel && scene[beat.panel];
  const focused = snippet && { ...snippet, highlightLines: selectedLines };
  const focus = scene.comparisonFocus;
  const focusCue = focus && timing.cues.find(item => item.text.startsWith(focus.cue));
  const elapsed = focusCue ? now - focusCue.startSec : -1;
  const focusActive = focus && focusCue && elapsed >= 0 && now <= focusCue.endSec + 0.35;
  const ramp = (from: number, to: number) => interpolate(elapsed, [from, to], [0, 1], {
    easing: Easing.inOut(Easing.ease), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const rampIn = (age: number) => interpolate(age, [0, 0.55], [0, 1], { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastDirection = preceding?.speech?.at(-1)?.direction;
  const precedingFont = lastDirection?.drawingPhase ? 34
    : !portrait && preceding?.comparisonStyle === "parallel" ? 27 : portrait ? 34 : 36;
  const codeView = (panel: NonNullable<typeof beat>["panel"], fontSize: number, parallel = false) => {
    const code = panel && scene[panel];
    if (!code) return null;
    if (sharedLayout && lastDirection?.panel && panel === scene.speech?.[0]?.direction?.panel) {
      const move = Easing.inOut(Easing.sin)(Math.min(1, frame / (1.25 * fps)));
      fontSize = precedingFont + move * (fontSize - precedingFont);
    }
    let word;
    if (panel !== "code" && focus && focusActive) {
      const text = focus[panel];
      if (refs && ref && cue === focusCue) {
        if (targetPanel === panel) {
          const start = Math.min(0.45, refWindow * 0.18);
          const finish = Math.min(1.65, refWindow * 0.85);
          word = { text, progress: interpolate(refAge, [start, finish], [0, 1], {
            easing: Easing.inOut(Easing.ease), extrapolateLeft: "clamp", extrapolateRight: "clamp",
          }), opacity: rampIn(refAge) };
        } else if (priorRef?.panel === panel) {
          // Fade the old token at its final width as the other panel takes focus.
          word = { text, progress: 1, opacity: 1 - rampIn(refAge) };
        }
      } else if (!refs) {
        word = { text, progress: panel === "codeBefore" ? ramp(0.65, 1.45) : ramp(2.85, 3.65),
          opacity: panel === "codeBefore" ? 1 - ramp(1.65, 2.5) : ramp(1.65, 2.5) };
      }
    }
    const lastPanel = preceding?.speech?.at(-1)?.direction?.panel;
    const entryCode = lastPanel && preceding?.[lastPanel];
    const priorPanel = previous?.panel;
    const swapped = !parallel && priorPanel && priorPanel !== panel;
    const prior = swapped ? scene[priorPanel] : cueIndex <= 0 ? (
      parallel && panel === "codeAfter" ? (sharedLayout ? undefined : scene.codeBefore) : entryCode
    ) : undefined;
    const changeFrame = swapped ? localFrame : frame;
    const progress = Math.max(0, changeFrame / (1.25 * fps));
    const morphing = !!refs && !!prior && prior.code !== code.code && progress < 1;
    const pinpoint = targetPanel === panel && ref?.targets ? (() => {
      // Give moving glyphs time to reach their final positions before marking the target.
      const settleDelay = prior && refs && prior.code !== code.code
        ? Math.max(0, 1.25 - (changeFrame / fps - refAge)) : 0;
      const age = Math.max(0, refAge - settleDelay);
      const duration = Math.max(1 / fps, refWindow - settleDelay);
      const fade = Math.min(0.65, duration * 0.45);
      const ease = (fraction: number) => Easing.inOut(Easing.sin)(Math.max(0, Math.min(1, fraction)));
      return { targets: ref.targets, repeated: timing.repeatedTargets,
        opacity: ease(age / fade) * ease((duration - age) / Math.min(0.35, duration * 0.4)),
        pulse: Math.sin(Math.PI * Math.min(1, age / Math.min(1, duration))) ** 2,
      };
    })() : undefined;
    const current = <CodePanel snippet={{...code, highlightLines: targetPanel === panel ? selectedLines : []}}
      animate={!refs && !scene.pathDestination && !parallel} fontSize={fontSize}
      hideGlyphs={morphing} pinpoint={pinpoint} wordFocus={word} lineBand={lineBand(panel)}/>;
    const content = !morphing ? current : <CodeGlyphMorph key={JSON.stringify([prior.code, code.code])} progress={progress}
      before={<CodePanel snippet={{...prior, highlightLines: []}} animate={false} fontSize={fontSize}/>}
      after={current}/>;
    return <div data-layout-part={panel} data-layout-id={code.code} style={{position: "relative", minWidth: 0}}><div>{content}</div></div>;
  };
  const flow = scene.valueFlow && focused;
  const stages = beat?.stages.map((stage, index) => {
    const entry = spring({ frame: Math.max(0, localFrame - index * 9), fps,
      config: { damping: 16, stiffness: 105, mass: 0.75 } });
    return <span key={index} style={{ opacity: Math.min(1, entry), display: "inline-block",
      transform: `translate(${(1-entry)*-34}px, ${(1-entry)*14}px) scale(${0.9+entry*0.1})`,
      color: index === beat.stages.length - 1 ? THEME.swiftAmber : THEME.textSecondary }}>
      {index > 0 && <span style={{ marginRight: 18 }}>›</span>}{stage}
    </span>;
  });
  const strip = <div style={{ visibility: showStageLabels ? "visible" : "hidden", display: "flex", flexWrap: "wrap", gap: 18, minHeight: 63,
    font: `650 ${portrait ? 37 : 40}px/1.5 ${FONT_SANS}` }}>{stages}</div>;
  if (flow && scene.valueFlow) return <ParameterValueFlow timing={timing} flow={scene.valueFlow} snippet={flow} direction={strip}/>;
  if (beat?.drawingPhase && scene.pathDestination && scene.drawingCorners && focused) {
    const entrance = scene.drawingEntrance;
    const ease = (age: number, seconds: number) => interpolate(age, [0, seconds], [0, 1], {
      easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const eventAge = (event: {cue: string; offsetSec: number}) => {
      const anchor = timing.cues.find(item => item.text.startsWith(event.cue));
      return anchor ? now - anchor.startSec - event.offsetSec : -1;
    };
    const layers = entrance && {
      paper: sharedLayout && preceding ? 1 : ease(frame / fps, 0.85),
      mark: ease(eventAge(entrance.mark), 0.5),
      pencil: ease(eventAge(entrance.place), 0.85),
      lift: beat.drawingPhase === "complete" ? ease(localFrame / fps, 0.6) : 0,
    };
    const cueFrames = Math.max(1, Math.round((cue.endSec - cue.startSec) * fps));
    const duration = beat.drawingPhase === "move" ? Math.min(0.9 * fps, cueFrames) : cueFrames * 0.86;
    const drawDelay = entrance && beat.drawingPhase === "draw" ? (refs?.[0]?.offsetSec ?? 0) * fps : 0;
    const progress = Math.max(0, Math.min(1, (localFrame - drawDelay) / Math.max(1, duration - drawDelay)));
    return <AbsoluteFill style={{padding: portrait ? "355px 7% 0" : "205px 6% 0", gap: portrait ? 32 : 26}}>
      <div data-layout-part="heading"><SceneTitle heading={scene.heading} eyebrow={scene.chapterTitle}/></div>
      {strip}
      <div style={{display: "grid", gridTemplateColumns: portrait ? "1fr" : "1.17fr 1fr",
        gap: portrait ? 30 : 42, alignItems: "center"}}>
        {codeView(beat.panel, 34)}
        <div data-layout-part="paper" data-layout-id={JSON.stringify([scene.pathDestination, scene.drawingCorners])} style={{order: portrait ? -1 : 0}}>
          <PathDrawing phase={beat.drawingPhase} start={scene.pathDestination} corners={scene.drawingCorners} progress={progress} entrance={layers}/>
        </div>
      </div>
    </AbsoluteFill>;
  }
  const comparePaths = scene.pathDestination && scene.comparisonStyle === "parallel" && !portrait;
  const timeline = scene.milestones?.some(point => beat?.stages.includes(point.date)) && scene.milestones;
  return <AbsoluteFill style={{ padding: portrait ? "500px 8% 0" : "244px 14% 0", gap: 30 }}>
    <div data-layout-part="heading"><SceneTitle heading={scene.heading} eyebrow={scene.chapterTitle}/></div>
    {timeline && <div data-layout-part="timeline" data-layout-id={JSON.stringify(timeline)} style={{ display: "flex", gap: 18 }}>
      {timeline.map((point, index) => <div key={point.date} style={{ flex: 1,
        borderTop: `4px solid ${index <= cueIndex ? THEME.swiftAmber : THEME.borderSubtle}`,
        paddingTop: 12, font: `500 27px ${FONT_SANS}`, color: THEME.textSecondary,
        opacity: index <= cueIndex ? 1 : 0.45 }}>{point.date}</div>)}
    </div>}
    {strip}
    {comparePaths && scene.codeBefore && scene.codeAfter ? (
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginInline: "-8%"}}>
        {(["codeBefore", "codeAfter"] as const).map(panel =>
          <React.Fragment key={panel}>{codeView(panel, 27, true)}</React.Fragment>)}
      </div>
    ) : focused && codeView(beat?.panel, portrait ? 34 : 36)}
    {scene.pathDestination && <div data-layout-part="destination" data-layout-id={JSON.stringify(scene.pathDestination)} style={{display: "flex", alignItems: "center", gap: 16,
      color: THEME.textPrimary, font: `600 ${portrait ? 34 : 31}px ${FONT_SANS}`}}>
      <span style={{width: 18, height: 18, borderRadius: "50%", background: THEME.swiftAmber}} />
      목적지 ({scene.pathDestination.x}, {scene.pathDestination.y})
    </div>}
  </AbsoluteFill>;
}
