---
type: chronicle
date: "2026-11-27"
---

# Native scan texture in the Unicode film

The creator asked to take apart the printed material, animate the pieces and retain the noise of the old scan. This revises the ink-density treatment proposed in [[2026-11-27-unicode-ink-studies]] for this film.

The mapping row and the blank paper came from the JPEG embedded on PDF page 3 of the second Han chart file. The two forms of 青 came from PDF page 76 of the first file. Export the embedded images with pdfimages -j. Rotate the mapping image clockwise and the character chart counterclockwise by 90 degrees. The row occupies (94, 181)–(447, 224), the characters occupy (440, 382)–(506, 504), and the clean margin occupies (742, 30)–(963, 135). Coordinates use the upright raster and exclude the bottom and right endpoints. The margin supplies the stage texture. Local gray marks move with their own printed fragment. The origin of each individual mark is unknown. [Mapping table, printed page 171](https://www.unicode.org/versions/Unicode1.0.0/HanCharts2.pdf#page=3) · [Character chart, printed page 98](https://www.unicode.org/versions/Unicode1.0.0/HanCharts1.pdf#page=76)

The four shots trace three mappings, unfold the Korean row and column, separate the lower parts of the two glyphs and enlarge a single stroke. The grid is an editorial drawing. The final shot samples the source pixels directly. Both PNG crops match the decoded PDF images. Reassembling all fragments of each partition gave zero differing pixels at native resolution, before video encoding. The four-shot reel contains 1,469 frames at 24 fps. [Interactive comparison](../../episodes/unicode-1.0/motion/초판-스캔.html) · [Stroke enlargement](../../episodes/unicode-1.0/motion/grain.mp4) · [Four-shot reel](../../episodes/unicode-1.0/motion/unicode-scan-motion.mp4)
