import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import { FONT_SANS, THEME } from "../theme";

export function PersonCard({ timing }: { timing: ResolvedSceneTiming }) {
  const { fps, width, height } = useVideoConfig();
  const now = timing.startSec + useCurrentFrame() / fps;
  const cue = timing.cues.find(item => now >= item.startSec && now < item.endSec);
  if (!cue) return null;
  const people = timing.scene.people?.filter(person => cue.text.includes(person.cue));
  if (!people?.length) return null;
  const portrait = height > width;
  return <aside style={{position: "absolute", right: portrait ? 76 : 72, top: portrait ? 198 : 100,
    display: "flex", flexDirection: portrait ? "column" : "row", gap: 15, fontFamily: FONT_SANS}}>
    {people.map(person => <div key={person.profile} style={{display: "flex", alignItems: "center",
      gap: 16, padding: "12px 20px", borderRadius: 12, background: "#242425", color: THEME.textPrimary,
      borderLeft: `4px solid ${THEME.swiftOrange}`}}>
      {person.photo && <Img src={staticFile(person.photo.file)} style={{width: 108, height: 108, objectFit: "contain"}} />}
      <div>
        <div style={{fontSize: portrait ? 36 : 32, fontWeight: 700}}>{person.name}</div>
        <div style={{fontSize: portrait ? 29 : 25, color: THEME.swiftAmber}}>{person.account}</div>
        {person.photo && <div style={{fontSize: 17, color: THEME.textSecondary}}>{person.photo.credit}</div>}
      </div>
    </div>)}
  </aside>;
}
