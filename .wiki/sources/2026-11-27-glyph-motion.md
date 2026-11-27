---
type: chronicle
date: "2026-11-27"
---

# Track shared letters when a code sample changes

The creator asked to transform the letters themselves and said that the previous background sweep felt rushed. [Creator feedback](t3-thread://v2/4976b4a8-e1c4-4543-877c-25d62dfa39d1/2753ea1c-ac4d-4db4-bcc0-2e5b727de699)

Shiki Magic Move compares highlighted code steps and animates their differences. Motion Canvas supports diff-based animation and explicit edits. We used this edit model for SE-0005. The renderer measures both layouts in Menlo, pairs the longest shared runs of characters, moves the paired letters and fades local insertions and deletions. The episode uses a 1.25-second edit. The background sweep takes up to 0.95 seconds after the spoken reference and reserves reading time in shorter cues. These timings are episode production choices. [Shiki Magic Move](https://shiki.style/packages/magic-move) · [Motion Canvas code editing](https://motioncanvas.io/docs/code/) · [Exported edit](../../episodes/SE-0005/out/SE-0005-code-transition-ko.mp4) · [Exported highlight](../../episodes/SE-0005/out/SE-0005-line-highlight-ko.mp4)
