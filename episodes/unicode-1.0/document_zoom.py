"""Pull back from the enlarged ink inside a letter of the registered document."""
import json
import math
from functools import lru_cache
import numpy as np
from PIL import Image, ImageOps
from scipy.ndimage import distance_transform_edt, gaussian_filter
from draw import ROOT
from microtype import DENSITY, INK, PAPER, PEAK_SCALE, focus, plate as stroke_plate


@lru_cache(None)
def source():
    prefix = ROOT / "art/xerox-line"
    with Image.open(prefix.with_suffix(".png")) as page:
        ink = np.array(ImageOps.invert(page.convert("L")), dtype=np.float32)
    height, width = ink.shape
    y, x = np.ogrid[:height, :width]
    # Feather only the clipped outer words at the margins of the excerpt.
    margin = np.minimum(np.minimum(x, width - 1 - x) / 95, np.minimum(y, height - 1 - y) / 60)
    return Image.fromarray((ink * np.clip(margin, 0, 1)).astype("uint8")), json.loads(
        prefix.with_suffix(".json").read_text()
    )


def imprint(alpha):
    result = Image.new("RGBA", alpha.size, (INK, INK, INK, 0))
    result.putalpha(alpha)
    return result


def placement(portrait):
    return (52, 415, 610) if portrait else (74, 281, 560)


@lru_cache(None)
def document_item(portrait):
    from draw import Item

    x, y, width = placement(portrait)
    return Item(imprint(source()[0]), x, y, width=width)


@lru_cache(None)
def heap_levels():
    plate = stroke_plate()
    plate_arr = np.asarray(plate, dtype=np.float32)
    # Sample interior ink patches of ㄱ (avoiding its blank lower-left paper quadrant)
    # so the wider pullback inside X stays continuously filled with weathered glyphs.
    patch = 360
    half = patch // 2
    ink_dt = distance_transform_edt(gaussian_filter(plate_arr, 10.0) < 225.0)
    valid_ys, valid_xs = np.nonzero(ink_dt >= half + 12)
    if len(valid_xs) == 0:
        valid_ys, valid_xs = np.nonzero(ink_dt >= 80)

    field = Image.new("L", (4608, 2880), 130)
    rng = np.random.default_rng(0x3131)
    yy, xx = np.ogrid[:patch, :patch]
    edge = np.minimum(np.minimum(xx, patch - 1 - xx), np.minimum(yy, patch - 1 - yy))
    feather = Image.fromarray(np.uint8(255 * np.clip(edge / 64, 0, 1)))
    for top in range(-64, field.height, patch - 84):
        for left in range(-64, field.width, patch - 84):
            pick = int(rng.integers(len(valid_xs)))
            cx = int(np.clip(valid_xs[pick], half, plate.width - half))
            cy = int(np.clip(valid_ys[pick], half, plate.height - half))
            piece = plate.crop((cx - half, cy - half, cx + half, cy + half))
            field.paste(piece, (left, top), feather)

    # Paste the registered corner region of ㄱ at the splice centre, masking out blank paper
    # beyond ㄱ's contour while keeping the entire splice aperture 100% unfeathered.
    dx, dy = 680, 420
    ax, ay = focus(plate)
    ix, iy = round(ax), round(ay)
    original = plate.transform(
        (dx * 2, dy * 2),
        Image.Transform.EXTENT,
        (ix - dx, iy - dy, ix + dx, iy + dy),
        fillcolor=PAPER,
    )
    orig_arr = np.asarray(original, dtype=np.float32)
    orig_ink_dt = distance_transform_edt(gaussian_filter(orig_arr, 8.0) < 232.0)
    yy, xx = np.ogrid[-dy:dy, -dx:dx]
    box_core = np.minimum((dx - np.abs(xx)) / 120.0, (dy - np.abs(yy)) / 90.0)
    contour_core = (orig_ink_dt - 8.0) / 28.0
    # Guarantee 100% weight across the exact camera splice window (320x126 landscape, 180x225 portrait).
    splice_lock = np.maximum(
        0.0,
        1.0 - np.maximum((np.abs(xx) - 324.0) / 24.0, (np.abs(yy) - 228.0) / 24.0),
    )
    alpha_mask = np.clip(np.maximum(np.minimum(box_core, contour_core), splice_lock), 0.0, 1.0)
    field.paste(
        original,
        (field.width // 2 - dx, field.height // 2 - dy),
        Image.fromarray(np.uint8(255 * alpha_mask)),
    )
    centre = (field.width / 2 + ax - ix, field.height / 2 + ay - iy)
    plate = field
    levels = [plate]
    while min(plate.size) > 8:
        plate = plate.resize(tuple((v + 1) // 2 for v in plate.size), Image.Resampling.BOX)
        levels.append(plate)
    return levels, centre


def sample_heap(w, h, cx, cy, retreat):
    levels, (fx, fy) = heap_levels()
    scale = PEAK_SCALE / retreat
    pitch = DENSITY / scale
    level = max(0, math.log2(pitch))
    i = min(int(level), len(levels) - 1)

    def sample(image):
        kx, ky = image.width / levels[0].width, image.height / levels[0].height
        x, y = fx - cx * pitch, fy - cy * pitch
        box = (x * kx, y * ky, (x + w * pitch) * kx, (y + h * pitch) * ky)
        image = image.transform(
            (w, h), Image.Transform.EXTENT, box, Image.Resampling.BICUBIC, fillcolor=130
        )
        return np.clip((PAPER - np.asarray(image, dtype=np.float32)) * 255.0 / (PAPER - INK), 0, 255)

    fraction = min(1, level - i)
    return sample(levels[i]) * (1 - fraction) + sample(levels[min(i + 1, len(levels) - 1)]) * fraction


def document_frame(portrait, progress):
    from film_opening import gate, stage_geometry

    sx, sy, w, h = stage_geometry(portrait)
    alpha, meta = source()
    x, y, width = placement(portrait)
    ax, ay = meta["anchor"]
    start = math.hypot(w, h) / meta["radius"]
    finish = width / alpha.width
    scale = start * (finish / start) ** progress
    retreat = start / scale
    pan = gate(progress, 0.42, 1.0)
    cx = w * 0.50 + (x - sx + ax * finish - w * 0.50) * pan
    cy = h * 0.49 + (y - sy + ay * finish - h * 0.49) * pan
    box = (ax - cx / scale, ay - cy / scale, ax + (w - cx) / scale, ay + (h - cy) / scale)
    shape = alpha.transform((w, h), Image.Transform.EXTENT, box, Image.Resampling.BICUBIC, fillcolor=0)
    ink = np.asarray(shape, dtype=np.float32)
    if retreat < 6.5:
        grain = sample_heap(w, h, cx, cy, retreat)
        fill = gate(math.log2(retreat), 0.25, 2.65)
        ink *= grain * ((1 - fill) / 255.0) + fill
    yy = np.ogrid[:h, :1][0]
    v_edge = np.minimum(yy, h - 1 - yy)
    ink *= gate(v_edge, 0, 30) * (1 - pan) + pan
    return imprint(Image.fromarray(np.uint8(np.clip(ink, 0, 255) + 0.5)))
