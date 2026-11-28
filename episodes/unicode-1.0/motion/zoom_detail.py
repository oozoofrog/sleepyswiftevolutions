"""Build the microscopic view and its local average in the original scan coordinates."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.ndimage import distance_transform_edt, gaussian_filter, map_coordinates

BOUNDS = (74, 13, 103, 21)
DENSITY = 256
LETTERS = "一靑青日月山雨水木田永人文風書心가나한글ㅎㅂㅁㄴㅅㄹㅈㅇあめのゆほカネルヲΩβλφξδπЖЯФДйжשמאקضهـعकअमचअ∞∑∂∫æßÞRfg"


def type_cases(row, forms):
    fonts = Path("/System/Library/Fonts/Supplemental")
    universal = ImageFont.truetype(str(fonts / "Arial Unicode.ttf"), 84)
    serif = ImageFont.truetype(str(fonts / "Times New Roman.ttf"), 88)
    masks = {}
    for char in dict.fromkeys(LETTERS):
        mask = Image.new("L", (190, 150))
        latin_or_greek = ord(char) < 0x0530
        ImageDraw.Draw(mask).text((95, 75), char, font=serif if latin_or_greek else universal,
                                  fill=255, anchor="mm")
        masks[char] = mask.crop(mask.getbbox())
    for char, sheet, box in [("一", row, (75, 14, 104, 20)), ("靑", forms, (17, 12, 47, 41)),
                              ("青", forms, (18, 71, 47, 100))]:
        stamp = sheet.crop(box).point(lambda v: max(0, min(255, (236-v)*1.18)))
        masks[char] = stamp.crop(stamp.getbbox())
    return masks


def scanned_impressions(masks, row, forms):
    # The largest printed sample in this shot is about 25 scan pixels high.
    # Rasterize the added faces at that pitch before enlarging their impressions.
    donor = np.asarray(forms, dtype=np.float32)
    residual = np.clip(donor-gaussian_filter(donor, .9), -32, 32)
    rng = np.random.default_rng(171)
    library = {}
    for char, mask in masks.items():
        library[char] = []
        for _ in range(4):
            pitch = rng.uniform(20, 30)/max(mask.size)
            size = tuple(max(2, round(length*pitch)) for length in mask.size)
            small = np.pad(np.asarray(mask.resize(size, Image.Resampling.LANCZOS), dtype=float), 3)
            yy, xx = np.indices(small.shape, dtype=np.float32)
            offset = rng.uniform(0, 60, 4)
            def trace(a,b):
                return map_coordinates(residual, (a,b), order=1, mode="mirror")/32
            dy = .45*trace(yy+offset[0], xx+offset[1])
            dx = .45*trace(xx+offset[2], yy+offset[3])
            coverage = map_coordinates(small, (yy+dy,xx+dx), order=1, mode="nearest")
            coverage = gaussian_filter(coverage, rng.uniform(.25,.56))
            ink = trace(yy+offset[3], xx+offset[0])
            coverage *= .96+.08*ink
            stamp = Image.fromarray(np.uint8(np.clip(coverage,0,255)))
            library[char].append(stamp.crop(stamp.point(lambda v: 255 if v>4 else 0).getbbox()))
    # Extend measured dark samples into an ink texture without importing a second glyph outline.
    donor = np.concatenate([np.asarray(row)[:, :66], donor[:43]],axis=1)
    nearest = distance_transform_edt(donor>57,return_distances=False,return_indices=True)
    ink = donor[tuple(nearest)].astype(np.float32)
    return library, np.clip(ink - np.median(ink), -24, 40)


def build_type_plate(directory: Path, work: Path):
    row = Image.open(directory / "row.png").convert("L")
    forms = Image.open(directory / "forms.png")
    masks, ink_texture = scanned_impressions(type_cases(row, forms), row, forms)
    chars = list(masks)
    x0, y0, x1, y1 = BOUNDS
    source = np.asarray(row, dtype=np.float32)
    support = source.copy()
    # Replace the printed ink with paper sampled just above and below the stroke.
    for y in range(14, 20):
        support[y, 75:103] = np.interp(y, [13, 20], [1, 0])*source[13, 75:103] + (y-13)/7*source[20, 75:103]
    paper = Image.fromarray(np.rint(support).astype("uint8"))
    plate = paper.crop(BOUNDS).resize(((x1-x0)*DENSITY, (y1-y0)*DENSITY), Image.Resampling.BICUBIC)
    # Real blank-margin grain stays in the gaps even at the closest magnification.
    grain = np.asarray(Image.open(directory / "paper.png"), dtype=np.int16)
    grain = grain - np.median(grain)
    local = np.asarray(plate, dtype=np.int16).copy()
    for y in range(0, local.shape[0], grain.shape[0]):
        strip = local[y:y+grain.shape[0]]
        strip += np.tile(grain, (1, 1+local.shape[1]//grain.shape[1]))[:strip.shape[0], :strip.shape[1]].astype(np.int16)
    plate = Image.fromarray(np.uint8(np.clip(local, 0, 255)))
    rng = np.random.default_rng(0x4E00)
    count = 0
    # Smaller, lighter type remains visible through gaps in the later impressions.
    # Each pass places independent points throughout the original ink footprint.
    for attempts, size, value_range in [
        (57000, .056, (58, 133)), (13500, .128, (35, 110)),
        (3200, .245, (24, 87)), (720, .405, (10, 64))]:
        xs = rng.uniform(75, 102, attempts)
        ys = rng.uniform(14.7, 18.75, attempts)
        tone = map_coordinates(source, (ys-.5, xs-.5), order=3, mode="nearest")
        probability = np.clip((224-tone)/208, 0, 1)**1.5
        selected = rng.random(attempts) < probability
        for x, y in zip(xs[selected], ys[selected]):
            variants = masks[chars[rng.integers(len(chars))]]
            stamp = variants[rng.integers(len(variants))]
            length = DENSITY*size*np.exp(rng.uniform(-.46,.42))
            ratio = length/max(stamp.size)
            glyph = stamp.resize((max(1, round(stamp.width*ratio)), max(1, round(stamp.height*ratio))),
                                 Image.Resampling.LANCZOS)
            # The local incline biases the heap, while individual pieces tilt independently.
            angle = rng.normal(10*np.sin(x*1.4+y), 25 if size < .4 else 17)
            glyph = glyph.rotate(float(angle), resample=Image.Resampling.BICUBIC, expand=True)
            origin = (round((x-x0)*DENSITY-glyph.width/2), round((y-y0)*DENSITY-glyph.height/2))
            plate.paste(int(rng.integers(*value_range)), origin, glyph)
            count += 1
    yy = np.asarray(plate).copy()
    for start in range(0, yy.shape[0], 96):
        strip = yy[start:start+96]
        y, x = np.indices(strip.shape, dtype=np.float32)
        y += start
        mottling = map_coordinates(ink_texture, (.28*y+.044*x,.28*x-.044*y),
                                  order=1,mode="mirror")
        strip[:] = np.rint(np.clip(strip+(1-strip/255.)*mottling*.75,0,255))
    plate = Image.fromarray(yy)
    path = work / "type-plate.webp"
    plate.save(path, lossless=True, method=4)
    mean = work / "type-tone.png"
    # The optical transition transfers fine texture before it changes the local ink tone.
    plate.resize(((x1-x0)*8,(y1-y0)*8),Image.Resampling.BOX).filter(ImageFilter.GaussianBlur(2.4)).save(mean)
    print(f"Microscopic plate: {count} impressions, {len(chars)} distinct glyphs", flush=True)
    return path, mean, dict(x=x0, y=y0, width=x1-x0, height=y1-y0)
