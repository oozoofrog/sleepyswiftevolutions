# Reading type in the Swift Evolution series

Collected 2026-11-27. The study asks how a viewer can read a Korean clause and distinguish Swift operators at mobile playback size. Subjective comfort, reading speed and character identification are different outcomes.

| Face | Role to try | Evidence and limits |
| --- | --- | --- |
| Nanum Myeongjo | Short archival titles | Already selected by the archive-print heading rule. Compare its fine strokes after encoding. The historical tone is an editorial judgment. [Naver specimens](https://hangeul.naver.com/download) |
| Nanum Gothic | Explanatory notes and contributor names | Compare the same Korean clause at the same size and weight. This is a Korean sans-serif candidate. [Naver specimens](https://hangeul.naver.com/download) |
| Apple SD Gothic Neo | Korean control sample | Present in the project's sans stack and on the production Mac. The specimen is rasterized on that Mac. |
| D2Coding | Swift code with Korean comments | Naver's programming face supports Hangul and Latin. Inspect punctuation and column alignment. Use the standard non-ligature variant when the operator itself is the subject. [D2 Coding](https://github.com/naver/d2-coding-font) |
| Menlo | Local code comparison | Compare the same ASCII identifiers and symbols with D2Coding. Local availability was checked with fontconfig. |
| Atkinson Hyperlegible Mono | Additional Latin identifier comparison | Designed for distinguishing similar characters, including for readers with low vision. Use a separate Korean face for Hangul. The publisher permits commercial use. This face is a reference, not part of the raster specimen. [Braille Institute](https://www.brailleinstitute.org/freefont/) |

Wallace and colleagues found individual differences in reading speed across fonts in their English-language study. The experiment does not rank Korean fonts for comfort during dark video playback. [Primary study](https://jdobr.es/pdf/Wallace-etal-2022-Font-Individuals.pdf)

Apple demonstrates the relationship between size, line wrapping and hierarchy in adaptive interfaces. For fixed video, review the encoded frame at its actual playback width. [WWDC typography examples](https://developer.apple.com/videos/play/wwdc2026/251/)

[Mac-rendered comparison sheet](specimen.png). All Korean lines use the same requested 35 px regular weight and 1.5 line height. Both code samples use 31 px. These are specimen sizes. For production, compare the final MP4 at 360 px playback width, keep the code stationary, and check whether viewers distinguish prefix from postfix without pausing. Compare a single variable per trial: font, size, leading, weight or contrast. Ask separately about comfort and token identification. No viewer evaluation has been conducted.

Initial trial preference: Myeongjo for a short title, Gothic for explanations, D2Coding for code. Keep notes left aligned. Wrap at a phrase boundary. For dense screens, shorten the note before shrinking the type.

## Creator selection · 2026-11-27

Use Apple system typography for titles, names and explanation text. Use Menlo for Swift code. Allow Apple SD Gothic Neo to supply Hangul glyphs in code comments. Apply the same families in landscape, portrait and thumbnails. Use Atkinson Hyperlegible Next for contributor handles and compact proposal, episode and version labels.
