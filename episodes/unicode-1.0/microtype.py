"""Build and photograph the opening ㄱ glyph. Only individual glyphs supply ink."""
import math
import subprocess
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
from scipy.ndimage import distance_transform_edt, gaussian_filter, map_coordinates

ROOT = Path(__file__).resolve().parent
ASSET = ROOT / "art/one-microtype.png"
DENSITY = 256
PEAK_SCALE = 512
WIDTH = 3840
PADDING = 36
PAPER = 249
INK = 24

# Iconic multilingual Unicode characters for recognizable macro reveal inside ㄱ.
HERO_GLYPHS = (
    "ㄱ", "한", "글", "가", "나", "一", "青", "靑", "日", "月", "水", "木", "文", "人",
    "あ", "の", "カ", "Ω", "β", "λ", "π", "Ж", "Я", "Ф", "A", "R", "g",
    "ש", "ع", "क", "अ", "∞", "∑", "æ", "ß",
)


def _stencil_font():
    try:
        out = subprocess.check_output(
            ["fc-match", "-f", "%{file}|%{index}", "NanumMyeongjo:weight=bold"], text=True
        ).strip()
        fpath, idx = out.split("|")
        return ImageFont.truetype(fpath, 1200, index=int(idx))
    except Exception:
        return ImageFont.truetype("/System/Library/Fonts/Supplemental/AppleMyungjo.ttf", 1200)


def _augment_masks(masks):
    """Ensure crisp Hangul jamo and syllable glyphs are present in the stamp case."""
    extra_font = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 88, index=6)
    out = dict(masks)
    for ch in ("ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅎ", "한", "글", "가", "나"):
        if ch not in out:
            mask = Image.new("L", (190, 150))
            ImageDraw.Draw(mask).text((95, 75), ch, font=extra_font, fill=255, anchor="mm")
            bb = mask.getbbox()
            if bb:
                out[ch] = mask.crop(bb)
    return out


def _weathered_stamps(masks, donor_forms, target_px, rng, variants_per_char=3):
    """Rasterize weathered archival letterpress stamps matched to their target pixel scale."""
    residual = np.clip(donor_forms - gaussian_filter(donor_forms, 0.9), -32, 32)
    min_pitch = max(18, min(int(target_px * 0.78), 110))
    max_pitch = max(min_pitch + 6, min(int(target_px * 1.00), 134))
    wobble = 0.46 if target_px >= 60 else 0.44
    blur_lo, blur_hi = (0.30, 0.54) if target_px >= 60 else (0.26, 0.50)

    library = {}
    for char, mask in masks.items():
        variants = []
        for _ in range(variants_per_char):
            pitch = rng.uniform(min_pitch, max_pitch) / max(mask.size)
            size = tuple(max(2, round(length * pitch)) for length in mask.size)
            small = np.pad(
                np.asarray(mask.resize(size, Image.Resampling.LANCZOS), dtype=np.float32),
                3,
            )
            yy, xx = np.indices(small.shape, dtype=np.float32)
            offset = rng.uniform(0, 60, 4)

            def trace(a, b):
                return map_coordinates(residual, (a, b), order=1, mode="mirror") / 32.0

            dy = wobble * trace(yy * 0.45 + offset[0], xx * 0.45 + offset[1])
            dx = wobble * trace(xx * 0.45 + offset[2], yy * 0.45 + offset[3])
            coverage = map_coordinates(small, (yy + dy, xx + dx), order=1, mode="nearest")
            coverage = gaussian_filter(coverage, rng.uniform(blur_lo, blur_hi))
            ink_var = trace(yy * 0.5 + offset[3], xx * 0.5 + offset[0])
            coverage *= 0.92 + 0.12 * ink_var
            coverage = np.clip(coverage, 0, 255)
            nz = np.argwhere(coverage > 6)
            if nz.size == 0:
                continue
            y0, x0 = nz.min(axis=0)
            y1, x1 = nz.max(axis=0) + 1
            variants.append(Image.fromarray(np.uint8(coverage[y0:y1, x0:x1])))
        if variants:
            library[char] = variants
    return library


def _stamp_overprint(canvas: np.ndarray, stamp_img: Image.Image, cx: float, cy: float, strength: float) -> None:
    """Physically accumulate letterpress ink (optical overprint) rather than overwriting darker strokes."""
    arr = np.asarray(stamp_img, dtype=np.float32) * (strength / 255.0)
    sh, sw = arr.shape
    h, w = canvas.shape
    x0 = round(cx - sw / 2)
    y0 = round(cy - sh / 2)
    x1 = x0 + sw
    y1 = y0 + sh
    if x1 <= 0 or y1 <= 0 or x0 >= w or y0 >= h:
        return
    sx0 = max(0, -x0)
    sy0 = max(0, -y0)
    sx1 = sw - max(0, x1 - w)
    sy1 = sh - max(0, y1 - h)
    dx0 = max(0, x0)
    dy0 = max(0, y0)
    dx1 = min(w, x1)
    dy1 = min(h, y1)
    patch = arr[sy0:sy1, sx0:sx1]
    region = canvas[dy0:dy1, dx0:dx1]
    region[:] = 1.0 - (1.0 - region) * (1.0 - patch)


def build():
    from motion.zoom_detail import scanned_impressions, type_cases

    row = Image.open(ROOT / "motion/row.png").convert("L")
    forms = Image.open(ROOT / "motion/forms.png").convert("L")
    masks = _augment_masks(type_cases(row, forms))
    _, ink_texture = scanned_impressions(masks, row, forms)
    donor_forms = np.asarray(forms, dtype=np.float32)

    face = _stencil_font()
    outline = Image.new("L", (1800, 1800))
    ImageDraw.Draw(outline).text((100, 100), "ㄱ", font=face, fill=255)
    outline = outline.crop(outline.getbbox())
    height = round(WIDTH * outline.height / outline.width)
    stencil = ImageOps.expand(
        outline.resize((WIDTH, height), Image.Resampling.LANCZOS), PADDING
    )
    stencil_arr = np.asarray(stencil, dtype=np.float32) / 255.0
    sh, sw = stencil_arr.shape

    inside = stencil_arr > 0.35
    dist_in = distance_transform_edt(inside)
    dist_out = distance_transform_edt(~inside)

    # Locate the thickest interior point at the calligraphic corner of ㄱ.
    fy_idx, fx_idx = np.unravel_index(np.argmax(dist_in), dist_in.shape)
    fx, fy = float(fx_idx), float(fy_idx)

    rng = np.random.default_rng(0x3131)
    all_letters = tuple(masks.keys())
    hero_letters = tuple(ch for ch in HERO_GLYPHS if ch in masks)

    small_lib = _weathered_stamps(masks, donor_forms, 26, rng, variants_per_char=3)
    med_lib = _weathered_stamps(masks, donor_forms, 52, rng, variants_per_char=3)
    large_lib = _weathered_stamps(masks, donor_forms, 92, rng, variants_per_char=3)
    hero_lib = _weathered_stamps(
        {ch: masks[ch] for ch in hero_letters}, donor_forms, 128, rng, variants_per_char=3
    )

    ink_density = np.zeros((sh, sw), dtype=np.float32)

    def sample_points(mask_2d: np.ndarray, count: int):
        ys, xs = np.nonzero(mask_2d)
        if len(xs) == 0:
            return np.empty(0), np.empty(0)
        idx = rng.integers(0, len(xs), size=count)
        return xs[idx].astype(np.float32), ys[idx].astype(np.float32)

    # Layer 1: Dense contour-forming miniature glyphs tracing both arms and the corner of ㄱ.
    xs, ys = sample_points(dist_in >= 6.0, 29000)
    for x, y in zip(xs, ys):
        ch = all_letters[int(rng.integers(len(all_letters)))]
        variants = small_lib.get(ch)
        if not variants:
            continue
        stamp = variants[int(rng.integers(len(variants)))]
        length = float(rng.uniform(17, 29))
        ratio = length / max(stamp.size)
        size = tuple(max(2, round(v * ratio)) for v in stamp.size)
        glyph = stamp.resize(size, Image.Resampling.LANCZOS)
        glyph = glyph.rotate(float(rng.normal(0, 18)), resample=Image.Resampling.BICUBIC, expand=True)
        near_edge = dist_in[round(float(y)), round(float(x))] < 26.0
        strength = float(rng.uniform(0.58, 0.80) if near_edge else rng.uniform(0.33, 0.52))
        _stamp_overprint(ink_density, glyph, float(x), float(y), strength)

    # Layer 2: Medium interior glyphs giving uniform archival ink depth.
    xs, ys = sample_points(dist_in >= 22.0, 6400)
    for x, y in zip(xs, ys):
        ch = all_letters[int(rng.integers(len(all_letters)))]
        variants = med_lib.get(ch)
        if not variants:
            continue
        stamp = variants[int(rng.integers(len(variants)))]
        length = float(rng.uniform(35, 58))
        ratio = length / max(stamp.size)
        size = tuple(max(2, round(v * ratio)) for v in stamp.size)
        glyph = stamp.resize(size, Image.Resampling.LANCZOS)
        glyph = glyph.rotate(float(rng.normal(0, 16)), resample=Image.Resampling.BICUBIC, expand=True)
        strength = float(rng.uniform(0.36, 0.54))
        _stamp_overprint(ink_density, glyph, float(x), float(y), strength)

    # Layer 3: Large readable glyphs spaced along the strokes.
    xs, ys = sample_points(dist_in >= 44.0, 1050)
    for x, y in zip(xs, ys):
        ch = all_letters[int(rng.integers(len(all_letters)))]
        variants = large_lib.get(ch)
        if not variants:
            continue
        stamp = variants[int(rng.integers(len(variants)))]
        length = float(rng.uniform(66, 98))
        ratio = length / max(stamp.size)
        size = tuple(max(2, round(v * ratio)) for v in stamp.size)
        glyph = stamp.resize(size, Image.Resampling.LANCZOS)
        glyph = glyph.rotate(float(rng.normal(0, 14)), resample=Image.Resampling.BICUBIC, expand=True)
        strength = float(rng.uniform(0.56, 0.78))
        _stamp_overprint(ink_density, glyph, float(x), float(y), strength)

    # Layer 4: Spaced dark hero Unicode glyphs across ㄱ, starting around the corner focus.
    placed_heroes: list[tuple[float, float]] = []
    focus_pool = list(hero_letters)
    rng.shuffle(focus_pool)
    for ch in focus_pool * 2:
        if len(placed_heroes) >= 34:
            break
        for _ in range(50):
            x = float(rng.uniform(fx - 360, fx + 360))
            y = float(rng.uniform(fy - 260, fy + 260))
            ix, iy = round(x), round(y)
            if not (0 <= ix < sw and 0 <= iy < sh) or dist_in[iy, ix] < 52.0:
                continue
            if all((x - px) ** 2 + (y - py) ** 2 >= 94.0 ** 2 for px, py in placed_heroes):
                placed_heroes.append((x, y))
                variants = hero_lib[ch]
                stamp = variants[int(rng.integers(len(variants)))]
                length = float(rng.uniform(100, 134))
                ratio = length / max(stamp.size)
                size = tuple(max(2, round(v * ratio)) for v in stamp.size)
                glyph = stamp.resize(size, Image.Resampling.LANCZOS)
                glyph = glyph.rotate(
                    float(rng.normal(0, 13)), resample=Image.Resampling.BICUBIC, expand=True
                )
                _stamp_overprint(ink_density, glyph, x, y, float(rng.uniform(0.88, 0.97)))
                break

    xs, ys = sample_points(dist_in >= 52.0, 2800)
    for x, y in zip(xs, ys):
        if len(placed_heroes) >= 280:
            break
        xf, yf = float(x), float(y)
        if all((xf - px) ** 2 + (yf - py) ** 2 >= 96.0 ** 2 for px, py in placed_heroes):
            placed_heroes.append((xf, yf))
            ch = hero_letters[int(rng.integers(len(hero_letters)))]
            variants = hero_lib[ch]
            stamp = variants[int(rng.integers(len(variants)))]
            length = float(rng.uniform(96, 132))
            ratio = length / max(stamp.size)
            size = tuple(max(2, round(v * ratio)) for v in stamp.size)
            glyph = stamp.resize(size, Image.Resampling.LANCZOS)
            glyph = glyph.rotate(
                float(rng.normal(0, 14)), resample=Image.Resampling.BICUBIC, expand=True
            )
            _stamp_overprint(ink_density, glyph, xf, yf, float(rng.uniform(0.86, 0.96)))

    outer_guard = np.clip(1.0 - np.maximum(0.0, dist_out - 2.0) / 8.0, 0.0, 1.0)
    ink_density *= outer_guard

    gray = PAPER - ink_density * (PAPER - INK)
    for start in range(0, sh, 96):
        strip = gray[start : start + 96]
        yy, xx = np.indices(strip.shape, dtype=np.float32)
        yy += start
        mottling = map_coordinates(
            ink_texture, (0.26 * yy + 0.04 * xx, 0.26 * xx - 0.04 * yy), order=1, mode="mirror"
        )
        strip[:] = np.clip(strip + (1.0 - strip / 255.0) * mottling * 0.58, 0.0, 255.0)

    return Image.fromarray(np.rint(gray).astype(np.uint8), mode="L")


@lru_cache(None)
def plate():
    with Image.open(ASSET) as image:
        return image.convert("L")


@lru_cache(maxsize=2)
def _corner_focus(size_and_id):
    im = plate()
    # Smooth out micro-pores so distance transform finds the true calligraphic corner knot of ㄱ.
    smoothed = gaussian_filter(np.asarray(im, dtype=np.float32), 14.0)
    dt = distance_transform_edt(smoothed < 228.0)
    fy_idx, fx_idx = np.unravel_index(np.argmax(dt), dt.shape)
    return float(fx_idx), float(fy_idx)


def focus(image):
    # If an in-memory modified plate is passed (e.g. check_opening.py knockout), keep the registered
    # focus of the canonical plate so the camera never jumps during the knockout test.
    canonical = plate()
    return _corner_focus(canonical.size)


@lru_cache(None)
def levels():
    image = plate()
    images = [image]
    while min(image.size) > 6:
        image = image.resize(tuple((v + 1) // 2 for v in image.size), Image.Resampling.BOX)
        images.append(image)
    return images


def photograph(size, scale, anchor):
    w, h = size
    original = plate()
    fx, fy = focus(original)
    pitch = DENSITY / scale
    x, y = fx - anchor[0] * pitch, fy - anchor[1] * pitch
    images = levels()
    lod = min(max(0, math.log2(pitch)), len(images) - 1)

    def sample(i):
        im = images[i]
        kx, ky = im.width / original.width, im.height / original.height
        box = (x * kx, y * ky, (x + w * pitch) * kx, (y + h * pitch) * ky)
        return im.transform(size, Image.Transform.EXTENT, box, Image.Resampling.BICUBIC, fillcolor=PAPER)

    i = int(lod)
    first = sample(i)
    return Image.blend(first, sample(i + 1), lod - i) if lod > i else first


if __name__ == "__main__":
    build().save(ASSET)
