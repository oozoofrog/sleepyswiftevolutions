import React from "react";
import { Easing } from "remotion";
import type { Scene } from "../../schema/script";
import type { ResolvedSceneTiming } from "../../lib/timeline";
import { FONT_MONO, FONT_SANS } from "../theme";

type Example = NonNullable<Scene["bibOrder"]>;
const ease = (n: number) => Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, n)));

export function BibOrder({ example, timing, now }: { example: Example; timing: ResolvedSceneTiming; now: number }) {
  let copy = example.initialCopy ? 1 : 0;
  let reorder = 0;
  for (const event of example.events) {
    const cue = timing.cues.find(item => item.text === event.cue);
    if (!cue) continue;
    const age = now - cue.startSec - event.offsetSec;
    if (age < 0) continue;
    if (event.operation === "copy") copy = ease(age / 1.1);
    else {
      reorder = ease(age / 1.1);
      copy *= 1 - reorder;
    }
  }
  const sorted = [...example.bibs].sort((a, b) => a - b);
  function row(label: string, variable: string, progress: number, visibility: number) {
    return <div style={{display: "flex", alignItems: "center", gap: 26, height: 87,
      borderTop: "1px solid #9e9071", paddingInline: 12,
      clipPath: `inset(0 ${100 * (1 - visibility)}% 0 0)`}}>
      <div style={{width: 220, fontFamily: FONT_SANS, fontSize: 30, fontWeight: 700, color: "#f4e6cf"}}>
        {label}<div style={{font: `21px ${FONT_MONO}`, color: "#cdbda1"}}>{variable}</div>
      </div>
      <div style={{position: "relative", height: 65, width: example.bibs.length * 91}}>
        {example.bibs.map((bib, i) => {
          const distance = sorted.indexOf(bib) - i;
          return <div key={bib} style={{position: "absolute", left: 0, top: 3, width: 72, height: 58,
            display: "grid", placeItems: "center", boxSizing: "border-box", borderRadius: 5,
            background: "#f4e6ce", color: "#342e26", borderBottom: "4px solid #be633b",
            font: `bold 34px ${FONT_MONO}`, transform: `translate(${91 * (i + progress * distance)}px, ${Math.sign(distance) * -12 * Math.sin(progress * Math.PI)}px)`}}>
            {[7, 59].map(x => <i key={x} style={{position: "absolute", top: 5, left: x, width: 5, height: 5, background: "#80735f", borderRadius: "50%"}}/>)}
            {bib}
          </div>;
        })}
      </div>
    </div>;
  }
  return <div data-layout-part="bibs" data-layout-id={`bibs-${example.bibs.join("-")}`}>
    {row("도착 기록", "bibs", reorder, 1)}
    {row("번호순 명단", "order", copy, copy)}
  </div>;
}
