import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import type {ResolvedSceneTiming} from "../../lib/timeline";
import {FONT_SANS, THEME} from "../theme";

export function TermNote({timing}: {timing: ResolvedSceneTiming}) {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const now = (frame + timing.startFrame) / fps;
  const active = timing.scene.termNotes?.find(note => {
    const cue = timing.cues.find(item => item.text.includes(note.cue));
    return cue && now >= cue.startSec && now < Math.max(cue.startSec + 4, cue.endSec);
  });
  if (!active) return null;
  const portrait = height > width;
  return <aside style={{position: "absolute", top: portrait ? 180 : 101, right: portrait ? 100 : 72,
    maxWidth: portrait ? 875 : 1300, background: THEME.codeSurface, color: THEME.textPrimary,
    borderLeft: `4px solid ${THEME.swiftOrange}`, borderRadius: 8, padding: "9px 18px",
    fontFamily: FONT_SANS, fontSize: portrait ? 30 : 27, lineHeight: 1.4, wordBreak: "keep-all"}}>
    <strong style={{color: THEME.swiftAmber, marginRight: 14}}>{active.term}</strong>{active.meaning}
  </aside>;
}
