---
name: scan-glyph-zoom
description: Create or revise a motion shot in which scanned ink resolves into overlapping Unicode glyphs as the camera approaches. Use for archival print zooms with weathered type and a continuous optical reveal.
---

# Scan-to-glyph zoom

Use the [approved 13-second Unicode shot](../../../episodes/unicode-1.0/motion/grain.mp4) as the visual reference. At reading distance the viewer sees the actual printed stroke. As the camera approaches its edge, marks that looked like ink grain become legible as small, overlapping letters.

## Build the shot

1. Extract a native-resolution crop of the stroke and sample its paper, gray edges and dark ink. Keep those samples registered to the page. Choose a recognizable point on the contour for the camera to follow.
2. Build a fixed close-up plate in those same coordinates. Scatter glyphs of different scripts in several passes. Vary size, tilt, overlap and ink density. Leave small impressions visible between the larger ones. Match the raster pitch of the printed samples before enlargement. Apply the observed edge softness and density variation to individual glyphs. Keep the paper grain stationary during playback.
3. Start with the original scan. Split the close-up plate into a local mean tone and fine detail. With increasing magnification, introduce fine detail along the gray edge first. Bring the darker body of the stroke toward the plate's mean tone later. Drive both changes from magnification so that scrubbing or pulling back retraces the effect.
4. Hold long enough to recognize several letters. Time that recognition to the narration. Identify the enlarged glyph arrangement as an editorial reconstruction when presenting it alongside a historical scan.

## Adapt the project renderer

The [plate generator](../../../episodes/unicode-1.0/motion/zoom_detail.py) contains the scan sampling, type impressions, layering and local tone map. The [camera and compositor](../../../episodes/unicode-1.0/motion/motion.js) implement the transition in `grainScene` and `drawOpticalDetail`. For another scan, adapt the source crops, plate bounds and camera anchor together in the target shot. Tune the reveal at playback size. The Unicode reference holds the scan through 4× and reaches 128×.

To rebuild the Unicode shot from the repository root on this Mac, use the existing narration stems and a fresh work directory on the mounted secondary volume. These commands replace the packaged reader and the standalone shot.

```sh
export TMPDIR=/Volumes/eyedisk/tmp
zoom_work=$(mktemp -d "$TMPDIR/scan-glyph-zoom.XXXXXXXX")
/Volumes/eyedisk/AI/Environments/earshot-py312/bin/python episodes/unicode-1.0/motion/package.py "$zoom_work"
node episodes/unicode-1.0/motion/export.mjs "$zoom_work" grain
```

## Check the illusion

- Compare the uncompressed opening against a scan-only rendering at the same framing. For the reference, the image window matches at 1×, 2× and 4×.
- Watch the intermediate zoom at normal speed. The edge should first read as rough ink, then resolve into letters. If the whole stroke lightens at once, delay the change in mean tone. If type looks freshly drawn, compare its edges and dark areas with a magnified printed glyph from the same scan.
- Compare inward and outward frames at matching magnifications. The same marks should occupy the same positions. Check the encoded video as well. See the [reference measurements and source pages](../../../.wiki/sources/2026-11-27-unicode-optical-print.md).

## Continue into a historical document

For a pullback into another document, choose a word the audience can read at the end. Register a point inside one printed letter. Carry the same close-up texture through that point. Let adjacent letters enter as the camera withdraws. Set the citation where it will remain legible when the camera stops. Show the document date separately from the event date.

Use Poppler and a Python environment with Pillow, NumPy and SciPy. Supply a searchable PDF and a crop in PDF points measured from the upper left. The crop must contain one occurrence of the anchor word. Choose a word with a visually separate initial letter. For the Unicode film, use the [1988 proposal](https://www.unicode.org/history/Unicode88.pdf#page=11).

```sh
export TMPDIR=/Volumes/eyedisk/tmp
/Volumes/eyedisk/AI/Environments/earshot-py312/bin/python \
  .agents/skills/scan-glyph-zoom/scripts/register_document.py "$pdf" \
  --page 11 --crop 307 240 489 285 --word Xerox \
  --output episodes/unicode-1.0/art/xerox-line
```

The tool writes the page excerpt and its registration JSON. The JSON records the PDF digest, crop, interior point and available ink radius. The [film compositor](../../../episodes/unicode-1.0/document_zoom.py) uses the radius to keep the first field of view inside the letter. Keep neighboring grain fixed in document coordinates while pulling back. At normal playback speed check the letter junction, the word, and the readable source line in order. Compare the uncompressed frames on both sides of each scene boundary in both aspect ratios.

Run the [opening check](../../../episodes/unicode-1.0/check_opening.py) with the same Python interpreter from the repository root. It compares both scene boundaries and samples the grain a second time through the moving document camera.

## Start with a stroke made entirely of small letters

For the chronology film, compose the distant character and its enlargement from one physical image. Use the modern letter only as a stencil. Start with blank paper, draw the small weathered glyphs, and clip their ink to the stencil. Reduce that image with area filtering for distant views. Sample the same coordinates at higher resolution as the camera advances. Feed the very same plate into the pullback.

Build the [opening plate](../../../episodes/unicode-1.0/microtype.py) with the Python interpreter listed above. Run `episodes/unicode-1.0/check_opening.py` afterwards. The check removes a small region of letters in memory and measures the change in the first frame, the identification shot, the moving zoom and the closest frame. This method is specific to a shot whose visible ink must come from the letters at every distance.
