---
type: chronicle
date: "2026-11-28"
---

# Post-credits cookie on Unicode 18.0, supported languages, Toto, and Han/Hangul extremes

The creator requested a post-credits cookie (`쿠키 · 오늘의 유니코드`) after the people epilogue to show the current Unicode version, how many languages Unicode supports, the rarest language, and the language using the most Unicode code points.

## Primary sources verified on 2026-11-28

- **Unicode 18.0.0 (released September 16, 2026)**: Encodes **172,808** graphic and format characters (`+13,007` over 17.0, adding Small Seal `11,328`, Jurchen, and Proto-Cuneiform numerals), up from **28,294** across Unicode 1.0 Volumes 1 & 2 (`1991–1992`). [Unicode 18.0.0 summary](https://www.unicode.org/versions/Unicode18.0.0/) · [Character count statistics](https://www.unicode.org/versions/stats/charcountv18_0.html)
- **Scripts and supported languages**: Per the Unicode FAQ and Supported Scripts list, Unicode encodes **175 scripts** used to write thousands of modern and ancient languages rather than individual languages directly. **Unicode CLDR 49** (released October 22, 2026) supports **172 base languages** across **185 coverage-level locales** (`100 Modern`, `12 Moderate`, `73 Basic`) and lists script metadata for **821 language tags**. [Unicode Basic FAQ](https://www.unicode.org/faq/basic_q.html) · [Supported Scripts](https://www.unicode.org/standard/supported.html) · [CLDR 49 Release Note](https://cldr.unicode.org/index/downloads/cldr-49)
- **Rarest living language with an encoded script**: **Toto (`txo`, block `U+1E290–U+1E2BF`, 31 characters)**, spoken by roughly **1,500 people** in the village of Totopara in West Bengal, India, near the Bhutan border, using the script created in May 2015 by elder Dhaniram Toto and encoded in Unicode 14.0 via SEI proposal `L2/19-330`. The exhibit uses page 2 of the official Unicode 18.0 code chart (`art/toto18.png`). [Proposal L2/19-330](https://www.unicode.org/L2/L2019/19330-toto-script.pdf) · [Unicode 18.0 Toto Chart](https://www.unicode.org/charts/PDF/U1E290.pdf)
- **Most Unicode characters**: **CJK Han ideographs** shared across East Asia lead overall with **102,999** characters (`59.6%` of Unicode 18.0; `103,352` including radicals/strokes in `Scripts.txt`). Among scripts dedicated to a single language, **Korean Hangul** ranks first (and #2 overall in `Scripts.txt`) with **11,739** characters, including `11,172` precomposed syllables. [UCD 18.0.0 Scripts.txt](https://www.unicode.org/Public/18.0.0/ucd/Scripts.txt)

## Production implementation and verification

- Added four two-sentence Long cookie scenes (`cookiever`, `cookielang`, `cookierare`, `cookiemost`) and four concise single-sentence Short cookie scenes (`scookiever`, `scookielang`, `scookierare`, `scookiemost`) in [narration.tsv](../../episodes/unicode-1.0/narration.tsv) across Korean, English, Japanese, and Simplified Chinese so the Short remains under YouTube’s `180s` limit while keeping every scene and exhibit card intact.
- Synthesized all eight new Korean voice clips with the registered Qwen3 voice clone (`voice.ts`), verified forced-alignment `다` endings and `qwen3-asr` transcriptions (adding a comma pause in `scookierare` speech so “토토어가” recognized accurately), and added a quiet post-credits `진양조` coda in [sanjo.py](../../episodes/unicode-1.0/sanjo.py) after the `자료와 제작` card.
- Rendered and verified all four MP4 deliverables and [unicode-tungso-sanjo.m4a](../../episodes/unicode-1.0/out/unicode-tungso-sanjo.m4a):
  - Landscape master and Korean viewing copy ([unicode-chronology-long.mp4](../../episodes/unicode-1.0/out/unicode-chronology-long.mp4)): `431.958s`, `13` chapters (`쿠키 · 오늘의 유니코드` starting at `371.167s`), `-15.0 LUFS` (`LRA 2.4 LU`, `Peak -2.7 dBFS`).
  - Portrait Short master and Korean viewing copy ([unicode-chronology-short.mp4](../../episodes/unicode-1.0/out/unicode-chronology-short.mp4)): `170.625s` (`< 180s`), `8` chapters (`쿠키 · 오늘의 유니코드` starting at `133.208s`), `-15.1 LUFS` (`LRA 2.6 LU`, `Peak -2.8 dBFS`).
