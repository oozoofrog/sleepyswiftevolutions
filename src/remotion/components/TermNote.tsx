import React from "react";
import {spring, useCurrentFrame, useVideoConfig} from "remotion";
import type {ResolvedSceneTiming} from "../../lib/timeline";
import {FONT_SANS, THEME} from "../theme";

export function TermNote({timing, fadeOut = false, spatial = false}: {timing: ResolvedSceneTiming; fadeOut?: boolean; spatial?: boolean}) {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const now = (frame + timing.startFrame) / fps;
  const active = timing.scene.termNotes?.find(note => {
    const cue = timing.cues.find(item => item.text.includes(note.cue));
    return cue && now >= cue.startSec && now < Math.max(cue.startSec + 4, cue.endSec);
  });
  if (!active) return null;
  const { startSec: start, endSec } = timing.cues.find(item => item.text.includes(active.cue))!;
  const exit = fadeOut ? Math.min(1, (Math.max(start + 4, endSec) - now) / 0.35) : 1;
  const enter = spring({frame: (now-start)*fps, fps, config: {damping: 18}});
  const portrait = height > width;
  return <aside style={{position: "absolute", opacity: spatial ? 1 : enter * exit, clipPath: spatial ? `inset(${100*(1-Math.min(1,enter)*exit)}% 0 0 0)` : undefined, transform: `translateY(${-22*(1-enter)}px)`, top: portrait ? 180 : 101, right: portrait ? 100 : 72,
    maxWidth: portrait ? 875 : 1300, background: THEME.codeSurface, color: THEME.textPrimary,
    borderLeft: `4px solid ${THEME.swiftOrange}`, borderRadius: 8, padding: "9px 18px",
    fontFamily: FONT_SANS, fontSize: portrait ? 30 : 27, lineHeight: 1.4, wordBreak: "keep-all"}}>
    <strong style={{color: THEME.swiftAmber, marginRight: 14}}>{active.term}</strong>{active.meaning}
  </aside>;
}
