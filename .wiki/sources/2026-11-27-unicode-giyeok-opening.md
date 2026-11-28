---
type: chronicle
date: "2026-11-27"
---

# Open the Unicode chronology with Hangul ㄱ (U+3131)

Creator feedback requested opening the Unicode 1.0 chronology on Hangul `ㄱ` rather than `一`.

1. **Opening glyph and optical corner trajectory**: Replaced the `一` stencil in [microtype.py](../../episodes/unicode-1.0/microtype.py) with a bold Myeongjo `ㄱ` (`3912×3097` plate) built solely from overlapping weathered Unicode letterforms, locating the camera focus at the thickest calligraphic corner junction `(3495, 432)`. In [film_opening.py](../../episodes/unicode-1.0/film_opening.py) and [document_zoom.py](../../episodes/unicode-1.0/document_zoom.py), `ㄱ` opens centered on the page, displays `기역` and `U+3131` (`HANGUL LETTER KIYEOK`, present since Unicode 1.0 Volume 1), glides into the corner bend of `ㄱ`, and pulls back out of the crossing of `X` in Becker’s August 1988 Xerox excerpt while sampling interior ink patches of `ㄱ` so no blank quadrant appears.
2. **Narration and Chapter 6 continuity**: Updated `choose`, `travel`, and `volume` across Korean, English, Japanese, and Simplified Chinese in [narration.tsv](../../episodes/unicode-1.0/narration.tsv) and [chronology.ko.md](../../episodes/unicode-1.0/chronology.ko.md) so `volume` explicitly introduces the Volume 2 Han cross-reference chart with `‘한 일’` rather than referring back to an opening `一`. Synthesized the three updated Korean lines with the registered local Qwen voice clone and verified pronunciation via `qwen3-asr` (adding a comma pause in `이 한글 자모, ‘기역’에도` after ASR caught liaison softening without the pause).

Verification: [check_opening.py](../../episodes/unicode-1.0/check_opening.py), `lint-korean.ts` (13 files), `voice.ts --check`, and full stream/chapter/subtitle/audio-hash verification passed on all four outputs (`346.79s` landscape, `134.21s` portrait) and the 32.0-second [opening preview](../../episodes/unicode-1.0/out/unicode-chronology-opening-ko.mp4).
