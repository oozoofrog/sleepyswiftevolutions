import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Easing, Freeze, useVideoConfig } from "remotion";

type Box = { left: number; top: number; width: number; height: number };

function bounds(element: HTMLElement, scale: number): Box {
  const r = element.getBoundingClientRect();
  return { left: r.left / scale, top: r.top / scale, width: r.width / scale, height: r.height / scale };
}

const ease = (value: number) => Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, value)));

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Keep the visible edge attached to the moving panel, including when a sheet is taller than the code.
function reveal(item: HTMLElement, box: Box, anchor: Box, moving: Box, progress: number) {
  const hidden = 1 - progress;
  if (item.dataset.layoutPart === "heading" || item.dataset.layoutPart === "destination") {
    item.style.transform = `translateY(${12 * hidden}px)`;
    item.style.clipPath = `inset(0 0 ${100 * hidden}% 0)`;
    return;
  }
  const dx = box.left + box.width / 2 - anchor.left - anchor.width / 2;
  const dy = box.top + box.height / 2 - anchor.top - anchor.height / 2;
  let x: number, y: number;
  if (Math.abs(dx) > Math.abs(dy)) {
    const right = dx >= 0;
    const gap = right ? box.left - anchor.left - anchor.width : anchor.left - box.left - box.width;
    x = right ? moving.left + moving.width + gap * progress - box.width * hidden
      : moving.left - gap * progress - box.width * progress;
    y = mix(moving.top + (moving.height - box.height) / 2, box.top, progress);
    const trim = Math.max(0, box.height - moving.height) * hidden / 2;
    item.style.clipPath = `inset(${trim}px ${right ? 0 : 100 * hidden}% ${trim}px ${right ? 100 * hidden : 0}%)`;
  } else {
    const below = dy >= 0;
    const gap = below ? box.top - anchor.top - anchor.height : anchor.top - box.top - box.height;
    y = below ? moving.top + moving.height + gap * progress - box.height * hidden
      : moving.top - gap * progress - box.height * progress;
    x = mix(moving.left + (moving.width - box.width) / 2, box.left, progress);
    const trim = Math.max(0, box.width - moving.width) * hidden / 2;
    item.style.clipPath = `inset(${below ? 100 * hidden : 0}% ${trim}px ${below ? 0 : 100 * hidden}% ${trim}px)`;
  }
  item.style.transform = `translate(${x - box.left}px, ${y - box.top}px)`;
}

export function SharedLayoutTransition({ previous, previousFrame, previousPanel, nextPanel, progress, children }: {
  previous: React.ReactNode; previousFrame: number; previousPanel: string; nextPanel: string;
  progress: number; children: React.ReactNode;
}) {
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);
  const { width } = useVideoConfig();
  useLayoutEffect(() => {
    const oldLayer = from.current!, newLayer = to.current!;
    const oldPanel = oldLayer.querySelector<HTMLElement>(`[data-layout-part="${previousPanel}"]`);
    const newPanel = newLayer.querySelector<HTMLElement>(`[data-layout-part="${nextPanel}"]`);
    if (!oldPanel || !newPanel) return;
    const scale = newLayer.getBoundingClientRect().width / width;
    const source = bounds(oldPanel, scale), destination = bounds(newPanel, scale);
    const move = ease(progress);
    const moving = {
      left: mix(source.left, destination.left, move), top: mix(source.top, destination.top, move),
      width: mix(source.width, destination.width, move), height: mix(source.height, destination.height, move),
    };
    const inner = newPanel.firstElementChild as HTMLElement;
    const changed = new Set<HTMLElement>();
    // Reset each property after the frame so a direct seek measures the natural layout.
    const edit = (element: HTMLElement) => { changed.add(element); return element.style; };
    const companions = (layer: HTMLElement, primary: HTMLElement) =>
      [...layer.querySelectorAll<HTMLElement>("[data-layout-part]")].filter(item => item !== primary)
        .map(item => ({item, box: bounds(item, scale)}));
    const exiting = companions(oldLayer, oldPanel);
    const entering = companions(newLayer, newPanel);
    edit(newPanel).zIndex = "3";
    edit(newPanel).height = `${destination.height}px`;
    edit(inner).width = `${moving.width}px`;
    edit(inner).transform = `translate(${moving.left - destination.left}px, ${moving.top - destination.top}px)`;
    const retained = new Set<HTMLElement>();
    for (const {item, box} of entering) {
      const id = item.dataset.layoutId;
      const match = id && exiting.find(old => old.item.dataset.layoutId === id && !retained.has(old.item));
      if (!match) continue;
      retained.add(item);
      retained.add(match.item);
      edit(item).transformOrigin = "top left";
      edit(item).transform = `translate(${(match.box.left - box.left) * (1-move)}px, ${(match.box.top - box.top) * (1-move)}px) scale(${1 + (match.box.width / box.width - 1) * (1-move)})`;
    }
    for (const {item, box} of exiting) {
      if (retained.has(item)) continue;
      edit(item).visibility = "visible";
      reveal(item, box, source, moving, 1 - ease(progress / 0.52));
    }
    for (const {item, box} of entering) {
      if (retained.has(item)) continue;
      edit(item);
      reveal(item, box, destination, moving, ease((progress - 0.15) / 0.85));
    }
    return () => {
      for (const element of changed) {
        for (const key of ["transform", "transform-origin", "width", "height", "clip-path", "visibility", "z-index"]) {
          element.style.removeProperty(key);
        }
      }
    };
  }, [progress, previousPanel, nextPanel, width]);
  return <>
    <AbsoluteFill ref={from} aria-hidden style={{visibility: "hidden", pointerEvents: "none"}}>
      <Freeze frame={previousFrame}>{previous}</Freeze>
    </AbsoluteFill>
    <AbsoluteFill ref={to}>{children}</AbsoluteFill>
  </>;
}
