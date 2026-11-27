import React from "react";
import type {Scene} from "../../schema/script";
import {FONT_MONO, FONT_SANS} from "../theme";

type Point = NonNullable<Scene["pathDestination"]>;
type Phase = NonNullable<NonNullable<NonNullable<Scene["speech"]>[number]["direction"]>["drawingPhase"]>;

export function PathDrawing({start, corners, phase, progress, entrance}: {
  start: Point;
  corners: Point[];
  phase: Phase;
  progress: number;
  entrance?: { paper: number; mark: number; pencil: number; lift: number };
}) {
  const points = [start, ...corners];
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const left = Math.min(...xs), right = Math.max(...xs);
  const top = Math.min(...ys), bottom = Math.max(...ys);
  const scale = Math.min(400 / Math.max(1, right - left), 193 / Math.max(1, bottom - top));
  const paper = points.map(p => ({
    x: 270 + (p.x - (left + right) / 2) * scale,
    y: 153 + (p.y - (top + bottom) / 2) * scale,
  }));
  const origin = paper[0];
  let tip = {...origin};
  const visible = [origin];
  if (phase === "draw" || phase === "complete") {
    const lengths = paper.slice(1).map((p, i) => Math.hypot(p.x - paper[i].x, p.y - paper[i].y));
    let remaining = lengths.reduce((sum, d) => sum + d, 0) * (phase === "complete" ? 1 : progress);
    for (const [i, distance] of lengths.entries()) {
      if (remaining <= 0) break;
      const fraction = distance === 0 ? 1 : Math.min(1, remaining / distance);
      tip = {x: paper[i].x + (paper[i+1].x - paper[i].x) * fraction,
        y: paper[i].y + (paper[i+1].y - paper[i].y) * fraction};
      visible.push(tip);
      remaining -= distance;
    }
  } else if (entrance || phase === "ready" || phase === "move") {
    const lift = entrance ? 1 - entrance.pencil : phase === "ready" ? 1 : 1 - progress;
    tip = {x: origin.x - 20 * lift, y: origin.y - 57 * lift};
  }

  return <svg viewBox="0 0 540 305" style={{display:"block", width:"100%", borderRadius:7,
    opacity: entrance?.paper ?? 1, transform: `translateY(${12 * (1 - (entrance?.paper ?? 1))}px)`,
    boxShadow:"0 6px 24px #17150f55"}} aria-label="경로의 시작점과 종이비행기 작도 과정">
    <defs><pattern id="paper-grid" width="19" height="19" patternUnits="userSpaceOnUse">
      <path d="M19 0H0V19" fill="none" stroke="#9caaab" opacity=".43" strokeWidth=".65"/>
    </pattern></defs>
    <rect width="540" height="305" fill="#f6ecd8"/>
    <rect x="12" y="12" width="516" height="250" fill="url(#paper-grid)" stroke="#c1b8a4"/>
    <polyline points={visible.map(p => p.x + "," + p.y).join(" ")} fill="none"
      stroke="#183b4b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle opacity={entrance?.mark} cx={origin.x} cy={origin.y} r="5.5" fill="#f6ecd8" stroke="#ac4324" strokeWidth="2.5"/>
    {(phase !== "complete" || entrance) && <g opacity={entrance && entrance.pencil * (1 - entrance.lift)} transform={`translate(${tip.x} ${tip.y - 10 * (entrance?.lift ?? 0)}) rotate(32)`}>
      <path d="M0 0 L-5 -13 V-52 H5 V-13 Z" fill="#d28737" stroke="#543a26" strokeWidth="1.2"/>
      <path d="M0 0 L-5 -13 H5 Z" fill="#edc991"/><path d="M0 0 L-1.7 -4.7 H1.7 Z" fill="#203341"/>
      <path d="M-1.7 -51 V-14" stroke="#f1c361" strokeWidth="2"/>
      <rect x="-5" y="-58" width="10" height="7" rx="1.5" fill="#ac5848"/>
      <path d="M-5 -52 H5" stroke="#cbc7b7" strokeWidth="3"/>
    </g>}
    <g opacity={entrance?.mark}>
    <circle cx="28" cy="283" r="5" fill="#ac4324"/>
    <text x="42" y="289" fill="#363c37" fontFamily={FONT_SANS} fontSize="19">시작점</text>
    <text x="110" y="289" fill="#363c37" fontFamily={FONT_MONO} fontSize="18">({start.x}, {start.y})</text>
    </g>
  </svg>;
}
