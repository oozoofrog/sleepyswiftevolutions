"""Render custom 16:9 and 9:16 thumbnails for the Unicode chronology episode."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from draw import ROOT, INK, MUTED, RED, Layout, Item, Detail, item_text, ruler, render_frame, px
from microtype import PAPER, plate

OUT = ROOT / "out"


def microtype_giyeok(target_width: int) -> Image.Image:
    """Crop the archival microtype ㄱ plate and turn white paper transparent."""
    gray = np.asarray(plate(), dtype=np.float32)
    ys, xs = np.where(gray < PAPER - 18)
    pad = 24
    x0, y0 = max(0, int(xs.min()) - pad), max(0, int(ys.min()) - pad)
    x1, y1 = min(gray.shape[1], int(xs.max()) + pad), min(gray.shape[0], int(ys.max()) + pad)
    crop = gray[y0:y1, x0:x1]
    alpha = np.clip((PAPER - crop) * 255.0 / (PAPER - 24.0), 0, 255).astype(np.uint8)
    rgba = Image.new("RGBA", (crop.shape[1], crop.shape[0]), (36, 42, 41, 0))
    rgba.putalpha(Image.fromarray(alpha))
    h = max(1, round(target_width * rgba.height / rgba.width))
    return rgba.resize((target_width, h), Image.Resampling.LANCZOS)


def make_thumbnail(portrait: bool) -> Image.Image:
    a = Layout("scan-paper", {})
    w, h = (720, 1280) if portrait else (1280, 720)
    left = 52 if portrait else 68

    stripe = Image.new("RGBA", (px(w), px(6)), RED)
    a.items["stripe"] = Item(stripe, 0, 0)

    if not portrait:
        item_text(a, "eyebrow", "UNICODE 1.0 — 18.0", "label", 19, left, 42, RED)
        item_text(a, "series", "유니코드 1.0 연대기", "title", 24, w - 280, 39, MUTED)
        ruler(a, "headrule", left, 84, w - 2 * left, "#a2a69f")

        item_text(a, "h1", "한 획에 붙은", "title", 68, left, 128, INK)
        item_text(a, "h2", "세 나라의 번호", "title", 68, left, 214, INK)
        item_text(a, "sub", "1986년 한자 대조표부터 172,808자 유니코드 18.0까지", "body", 22, left, 314, MUTED)
        ruler(a, "midrule", left, 368, 570, "#aaaba4")

        item_text(a, "code1", "U+4E00", "mono", 22, left, 394, RED)
        item_text(a, "glyph1", "一", "han", 26, left + 100, 403, RED)
        item_text(a, "code2", "U+3131", "mono", 22, left + 210, 394, INK)
        item_text(a, "glyph2", "ㄱ", "title", 26, left + 310, 397, INK)

        a.detail = Detail("p171", (0.073, 0.096, 0.364, 0.151), (left, 454, 570, 186))
        item_text(a, "folio", "제2권 171쪽 · 한자 대조표 (GB · JIS · KS)", "body", 17, left, 654, MUTED)

        glyph = microtype_giyeok(px(330))
        a.items["giyeok"] = Item(glyph, 805, 132, width=330)
        item_text(a, "glyphnote", "초판 인쇄 활자로 쌓아 올린 ‘기역’", "body", 18, 970, 526, MUTED, center=True)
        item_text(a, "stat", "175개 문자 체계 · 한글 11,739자", "body", 18, 970, 560, RED, center=True)

        rendered = render_frame(None, a, False, 1)
        return rendered.resize((1280, 720), Image.Resampling.LANCZOS)

    item_text(a, "eyebrow", "UNICODE 1.0 — 18.0", "label", 20, left, 52, RED)
    item_text(a, "series", "유니코드 1.0 연대기", "title", 22, w - 252, 50, MUTED)
    ruler(a, "headrule", left, 98, w - 2 * left, "#a2a69f")

    item_text(a, "h1", "한 획에 붙은", "title", 64, left, 146, INK)
    item_text(a, "h2", "세 나라의 번호", "title", 64, left, 228, INK)
    item_text(a, "sub1", "1986년 한자 대조표부터", "body", 24, left, 326, MUTED)
    item_text(a, "sub2", "172,808자 유니코드 18.0까지", "body", 24, left, 362, MUTED)

    glyph = microtype_giyeok(px(310))
    a.items["giyeok"] = Item(glyph, (w - 310) / 2, 430, width=310)
    item_text(a, "code1", "U+3131", "mono", 22, 198, 796, RED)
    item_text(a, "glyph1", "ㄱ", "title", 26, 298, 799, RED)
    item_text(a, "dot", "·", "body", 22, w / 2, 795, MUTED, center=True)
    item_text(a, "code2", "U+4E00", "mono", 22, 398, 796, RED)
    item_text(a, "glyph2", "一", "han", 26, 498, 805, RED)

    a.detail = Detail("p171", (0.073, 0.096, 0.364, 0.151), (left, 868, w - 2 * left, 212))
    item_text(a, "folio", "제2권 171쪽 · 한자 대조표 (GB · JIS · KS)", "body", 18, left, 1098, MUTED)
    item_text(a, "stat", "175개 문자 체계 · 한글 11,739자 · 토토어 31자", "body", 19, left, 1142, INK)

    rendered = render_frame(None, a, True, 1)
    # Add subtle outer frame margin accent on portrait card
    d = ImageDraw.Draw(rendered)
    d.rectangle((0, rendered.height - 8, rendered.width, rendered.height), fill=RED)
    return rendered


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    targets = [
        (False, OUT / "unicode-chronology-thumb.jpg"),
        (True, OUT / "unicode-chronology-short-thumb.jpg"),
    ]
    for portrait, dest in targets:
        im = make_thumbnail(portrait)
        im.save(dest, format="JPEG", quality=95, subsampling=0)
        size = dest.stat().st_size
        print(f"{dest.name}: {im.size[0]}x{im.size[1]}, {size} bytes")
        if size >= 2_000_000:
            raise RuntimeError(f"Thumbnail exceeds YouTube 2MB limit: {dest} ({size} bytes)")
