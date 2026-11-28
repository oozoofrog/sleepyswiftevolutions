---
type: chronicle
date: "2026-11-27"
---

# Refine the Unicode microtype plate and open the optical camera aperture

Following the interrupted delivery of the previous dated-proposal opening build (whose landscape Korean edition still carried the earlier missing-glyph font on “조 베커”), a production refinement addressed three visual issues observed in the rendered opening frames and completed all four editions.

1. **Optical ink accumulation and contour-formed edge**: Replaced opaque gray overwriting and hard stencil clipping in [microtype.py](../../episodes/unicode-1.0/microtype.py) with Beer-Lambert optical overprinting, distance-guided interior glyph placement so intact miniature characters form the contour of 一 without a straight guillotine edge, and scale-matched weathered letterpress stamps with spaced multilingual hero glyphs.
2. **Full-bleed optical camera aperture**: Replaced the clipped `1132×360` horizontal slit in [film_opening.py](../../episodes/unicode-1.0/film_opening.py) and [document_zoom.py](../../episodes/unicode-1.0/document_zoom.py) with a full-width paper aperture below the header rule (`1280×502` landscape, `720×900` portrait) and raised `PEAK_SCALE` to `512` so both the macro glyph field and the emerging serif `X` of “Xerox” fill the frame without artificial side clipping.
3. **Progressive opening draw-in**: Increased the subtle approach across `intro` and `choose` (`16.0 → 22.0 → 34.0` landscape; `12.8 → 17.6 → 27.5` portrait) so the micro-glyph grain becomes perceptible just before the plunge.

Verification: [check_opening.py](../../episodes/unicode-1.0/check_opening.py) passed pixel registration at both scene cuts and the single-plate knockout test in both aspect ratios. `lint-korean.ts` passed (13 files). All four outputs (`unicode-chronology-long.mp4`, `unicode-chronology-long-ko.mp4`, `unicode-chronology-short.mp4`, `unicode-chronology-short-ko.mp4`) and the 31.67-second [opening preview](../../episodes/unicode-1.0/out/unicode-chronology-opening-ko.mp4) decoded cleanly with matching audio hashes, chapters, and four subtitle tracks (`ko`, `en`, `ja`, `zh-Hans`). Creator visual review of this refinement is pending.
