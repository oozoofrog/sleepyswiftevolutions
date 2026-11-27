import React, { useLayoutEffect, useRef, useState } from "react";
import { Easing, interpolate } from "remotion";

interface Glyph {
  text: string;
  x: number;
  y: number;
  font: string;
  color: string;
}

function readGlyphs(panel: HTMLElement, scale: number): Glyph[] {
  const origin = panel.getBoundingClientRect();
  const result: Glyph[] = [];
  const range = document.createRange();
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  for (const token of panel.querySelectorAll<HTMLElement>("[data-code-token]")) {
    const node = token.firstChild;
    if (!node?.textContent) continue;
    const style = getComputedStyle(token);
    for (const {segment, index} of segmenter.segment(node.textContent)) {
      range.setStart(node, index);
      range.setEnd(node, index + segment.length);
      const box = range.getBoundingClientRect();
      result.push({
        text: segment, x: (box.left - origin.left) / scale,
        y: (box.top + box.height / 2 - origin.top) / scale,
        font: `${style.fontWeight} ${style.fontSize}/${style.lineHeight} ${style.fontFamily}`,
        color: style.color,
      });
    }
  }
  return result;
}

// Anchor the longest unchanged run first. Repeated letters then follow their surrounding identifier.
function pairGlyphs(before: Glyph[], after: Glyph[]) {
  const matches = new Map<number, number>();
  function match(a: number, aEnd: number, b: number, bEnd: number) {
    let longest = 0, left = a, right = b;
    const runs = new Uint32Array(bEnd - b + 1);
    for (let i = a; i < aEnd; i++) {
      for (let j = bEnd - 1; j >= b; j--) {
        const length = before[i].text === after[j].text ? runs[j - b] + 1 : 0;
        runs[j - b + 1] = length;
        if (length > longest) {
          longest = length;
          left = i + 1 - length;
          right = j + 1 - length;
        }
      }
    }
    if (!longest) return;
    match(a, left, b, right);
    for (let k = 0; k < longest; k++) matches.set(left + k, right + k);
    match(left + longest, aEnd, right + longest, bEnd);
  }
  match(0, before.length, 0, after.length);
  const used = new Set(matches.values());
  const paths: { from?: Glyph; to?: Glyph }[] = before.map((from, i) => ({from, to: after[matches.get(i) ?? -1]}));
  after.forEach((to, i) => { if (!used.has(i)) paths.push({to}); });
  return paths;
}

const smooth = (t: number, start: number, end: number) => interpolate(t, [start, end], [0, 1], {
  easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp",
});

export function CodeGlyphMorph({ before, after, progress }: {
  before: React.ReactElement; after: React.ReactElement<{style?: React.CSSProperties}>; progress: number;
}) {
  const source = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    paths: ReturnType<typeof pairGlyphs>; fromHeight: number; toHeight: number;
  }>();
  // The caller keys each edit by its endpoints. Measure real Menlo advances, wrapping and line breaks.
  useLayoutEffect(() => {
    const a = source.current!, b = target.current!;
    const measure = () => {
      if (!b.offsetWidth) return;
      const scale = b.getBoundingClientRect().width / b.offsetWidth;
      setLayout({paths: pairGlyphs(readGlyphs(a, scale), readGlyphs(b, scale)),
        fromHeight: a.offsetHeight, toHeight: b.offsetHeight});
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(b);
    return () => observer.disconnect();
  }, []);
  const move = smooth(progress, 0.12, 0.85);
  const exit = 1 - smooth(progress, 0, 0.32);
  const enter = smooth(progress, 0.55, 1);
  return <div style={{position: "relative", minWidth: 0, overflow: "hidden",
    height: layout && layout.fromHeight + (layout.toHeight - layout.fromHeight) * move}}>
    <div ref={source} aria-hidden style={{position: "absolute", inset: "0 0 auto", visibility: "hidden"}}>{before}</div>
    <div ref={target} aria-hidden style={{position: "absolute", inset: "0 0 auto", visibility: "hidden"}}>{after}</div>
    {React.cloneElement(after, {style: {...after.props.style, height: layout ? "100%" : undefined, boxSizing: "border-box"}})}
    {layout?.paths.map(({from, to}, i) => {
      const glyph = (progress < 0.5 ? from : to) ?? from ?? to!;
      if (!glyph.text.trim()) return null;
      const x = from && to ? from.x + (to.x - from.x) * move : glyph.x;
      const y = from && to ? from.y + (to.y - from.y) * move : glyph.y;
      return <span key={i} aria-hidden style={{position: "absolute", left: x, top: y,
        transform: "translateY(-50%)", font: glyph.font, color: glyph.color,
        opacity: from && to ? 1 : from ? exit : enter, whiteSpace: "pre", pointerEvents: "none"}}>{glyph.text}</span>;
    })}
  </div>;
}
