"""Move from contemporary Hangul ㄱ into the printed material of the chronology."""
import json
from functools import lru_cache
import numpy as np
from PIL import Image
from draw import ROOT, Layout, item_text, paste, render_frame, MUTED
from film import header
from microtype import DENSITY, INK, PAPER, PEAK_SCALE, focus, photograph, plate
from document_zoom import document_item, document_frame, placement


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def gate(x, a, b):
    return smooth((x - a) / (b - a))


@lru_cache(None)
def motion_chapters():
    html = (ROOT / "motion/초판-스캔.html").read_text()
    return json.JSONDecoder().raw_decode(html.split("const DATA=", 1)[1])[0]["chapters"]


def stage_geometry(p):
    # Full horizontal paper bleed below the header rule and above the Korean caption margin.
    return (0, 128, 720, 820) if p else (0, 102, 1280, 502)


@lru_cache(maxsize=24)
def ink_patch(p, base, travel):
    _, _, w, h = stage_geometry(p)
    scale = base * (PEAK_SCALE / base) ** travel
    material = plate()
    fx, fy = focus(material)
    # Center the full ㄱ silhouette at reading distance, then glide into its corner knot.
    cx0, cy0 = w * 0.50, h * 0.46
    tip_x = cx0 + (fx - material.width / 2) * base / DENSITY
    tip_y = cy0 + (fy - material.height / 2) * base / DENSITY
    g = gate(travel, 0, 0.76)
    anchor = (tip_x + (w * 0.50 - tip_x) * g, tip_y + (h * 0.49 - tip_y) * g)
    gray = np.asarray(photograph((w, h), scale, anchor), dtype=float)
    yy = np.ogrid[:h, :1][0]
    v_edge = np.minimum(yy, h - 1 - yy)
    alpha = np.clip((PAPER - gray) * 255.0 / (PAPER - INK), 0, 255) * gate(v_edge, 0, 6 + 24 * travel)
    im = Image.new("RGBA", (w, h), (INK, INK, INK, 0))
    im.putalpha(Image.fromarray(np.uint8(alpha + 0.5)))
    return im


@lru_cache(None)
def threshold_layout(p):
    a = Layout("scan-paper", {})
    header(a, p)
    x, y, width = placement(p)
    a.items["print"] = document_item(p)
    item_text(
        a,
        "documentCredit",
        "조 베커, 「Unicode 88」 3.1절 · 1988년 8월",
        "small",
        17,
        x,
        y + round(width * a.items["print"].pic.height / a.items["print"].pic.width) + 18,
        MUTED,
    )
    return a


@lru_cache(None)
def intro_paper(p):
    a = Layout("scan-paper", {})
    header(a, p)
    return render_frame(None, a, p, 1)


def opening(key, seconds, onset, duration, p):
    x, y, w, h = stage_geometry(p)
    choose = 0 if key == "intro" else (gate(seconds, onset + 0.10, onset + 2.45) if key == "choose" else 1)
    travel = gate(seconds, 0.15, duration - 0.65) if key == "travel" else 0
    if key == "archive":
        progress = gate(seconds, 0.25, duration - 0.78)
        if progress == 0:
            return opening("travel", duration, onset, duration, p)
        if progress == 1:
            return render_frame(None, threshold_layout(p), p, 1)
        page = intro_paper(p).copy()
        ink = document_frame(p, progress)
        paste(page, ink.resize((round(w * 1.5), round(h * 1.5)), Image.Resampling.LANCZOS), x, y)
        credit = threshold_layout(p).items["documentCredit"]
        paste(page, credit.pic, credit.x, credit.y, gate(progress, 0.94, 1.0))
        pile_credit(page, p, 1 - gate(progress, 0, 0.22))
        return page

    # Sized for ㄱ's classic proportion so it sits balanced on the page with U+3131 beneath.
    first, settled, selected = (14.5, 18.0, 23.0) if p else (13.5, 16.5, 20.5)
    if key == "intro":
        base = first + (settled - first) * gate(seconds, 0, duration - 0.3)
    else:
        base = settled + (selected - settled) * choose

    page = intro_paper(p).copy()
    ink = ink_patch(p, base, travel)
    pic = ink.resize((round(w * 1.5), round(h * 1.5)), Image.Resampling.LANCZOS)
    paste(page, pic, x, y)

    overlay = Layout("scan-paper", {})
    left = 52 if p else 72
    line = 165 if p else 126

    def label(k, s, face, sz, xx, yy, opacity, center=False, color="#2c2c2c"):
        if opacity <= 0.002:
            return
        item_text(overlay, k, s, face, sz, xx, yy, color, center)
        it = overlay.items[k]
        paste(page, it.pic, it.x, it.y, opacity)

    labels = 1 - gate(travel, 0, 0.16)
    heading_change = gate(seconds, 0, 0.85) if key == "choose" else choose
    date_opacity = 1 - gate(heading_change, 0, 0.55)
    intro_enter = gate(seconds, 0.12, 0.80) if key == "intro" else 1
    label("date", "1988년 8월 29일", "body", 32, left, line + 6 * (1 - intro_enter), intro_enter * date_opacity)
    signed = gate(seconds, onset + 1.3, onset + 2.1) if key == "intro" else 1
    label(
        "source",
        "조 베커  ·  Unicode 88",
        "body",
        22,
        left,
        line + 51 + 5 * (1 - signed),
        signed * date_opacity,
        False,
        MUTED,
    )
    label("name", "기역", "body", 32, left, line, gate(heading_change, 0.5, 1) * labels)
    material = plate()
    glyph_half_h = (material.height / 2) * selected / DENSITY
    number_y = y + h * 0.46 + glyph_half_h + (28 if p else 22)
    label("number", "U+3131", "mono", 22, x + w / 2, number_y, choose * labels, True, MUTED)
    if travel > 0:
        pile_credit(page, p, gate(travel, 0.68, 0.96))
    return page


@lru_cache(None)
def pile_label(p):
    x, y, _, h = stage_geometry(p)
    a = Layout("scan-paper", {})
    left = 52 if p else 72
    item_text(a, "ink", "초판의 인쇄 질감을 입힌 작은 글자들", "small", 17, left, y + h + 10, MUTED)
    return a.items["ink"]


def pile_credit(page, p, opacity):
    if opacity <= 0.002:
        return
    it = pile_label(p)
    paste(page, it.pic, it.x, it.y, opacity)
