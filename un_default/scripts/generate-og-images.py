#!/usr/bin/env python3
"""Regenerate Open Graph cards at 2× (2400×1260) so LinkedIn previews stay sharp."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

# LinkedIn display size is ~1200×630; render at 2× then keep full-res assets.
SCALE = 2
W, H = 1200 * SCALE, 630 * SCALE


def S(n: float) -> int:
    return int(round(n * SCALE))


def blob(
    od: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    r: int,
    color: tuple[int, int, int],
    alpha: int,
) -> None:
    for i in range(12, 0, -1):
        a = int(alpha * (i / 12) * 0.38)
        rr = int(r * (1.18 - i * 0.035))
        od.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(*color, a))


def draw_mark(draw: ImageDraw.ImageDraw, mark_x: int, mark_y: int, mark_s: int) -> None:
    draw.rounded_rectangle(
        [mark_x, mark_y, mark_x + mark_s, mark_y + mark_s],
        radius=S(20),
        fill="#000000",
    )
    scale = mark_s / 256
    bars = [
        (48, 48, 20, 160, "#FFFFFF", 0),
        (84, 48, 20, 160, "#FFFFFF", 0),
        (120, 48, 20, 160, "#FFFFFF", 0),
        (156, 48, 20, 160, "#FFFFFF", 0),
        (184, 48, 20, 160, "#FF6A00", 16),
    ]
    for bx, by, bw, bh, color, rot in bars:
        if rot == 0:
            x0 = mark_x + bx * scale
            y0 = mark_y + by * scale
            draw.rounded_rectangle(
                [x0, y0, x0 + bw * scale, y0 + bh * scale],
                radius=max(2, int(10 * scale)),
                fill=color,
            )
            continue
        cx = mark_x + (184 + 10) * scale
        cy = mark_y + 128 * scale
        w, h = 20 * scale, 160 * scale
        rad = math.radians(rot)
        pts = []
        for x, y in [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]:
            pts.append(
                (
                    cx + x * math.cos(rad) - y * math.sin(rad),
                    cy + x * math.sin(rad) + y * math.cos(rad),
                )
            )
        draw.polygon(pts, fill=color)


def band(draw: ImageDraw.ImageDraw) -> None:
    colors = ["#c45c4a", "#c4923a", "#2a7a6e", "#4a5d8a", "#b86b7a"]
    bw = W // len(colors)
    for i, c in enumerate(colors):
        draw.rectangle([i * bw, H - S(12), (i + 1) * bw if i < 4 else W, H], fill=c)


def base_canvas() -> Image.Image:
    img = Image.new("RGB", (W, H), "#f6f1e8")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    blob(od, S(160), S(-20), S(460), (196, 92, 74), 85)
    blob(od, S(1040), S(80), S(420), (42, 122, 110), 75)
    blob(od, S(780), S(580), S(380), (74, 93, 138), 50)
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def load_font(paths: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in paths:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def fonts() -> dict[str, ImageFont.FreeTypeFont | ImageFont.ImageFont]:
    serif_bold = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
    ]
    serif = [
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/Library/Fonts/Georgia.ttf",
    ]
    sans = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    mono = [
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/Library/Fonts/Andale Mono.ttf",
    ]
    return {
        "brand": load_font(serif_bold, S(40)),
        "title": load_font(serif_bold, S(68)),
        "body": load_font(sans, S(30)),
        "small": load_font(sans, S(24)),
        "mono": load_font(mono, S(28)),
    }


def chip(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, y: int) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    pad_x, pad_y = S(24), S(18)
    cw = bbox[2] - bbox[0] + pad_x * 2
    ch = bbox[3] - bbox[1] + pad_y * 2
    draw.rounded_rectangle([S(72), y, S(72) + cw, y + ch], radius=S(14), fill="#1a524a")
    draw.text((S(72) + pad_x, y + pad_y - S(1)), text, fill="#f6f1e8", font=font)


def save_pair(img: Image.Image, stem: str) -> None:
    png = PUBLIC / f"{stem}.png"
    jpg = PUBLIC / f"{stem}.jpg"
    img.save(png, "PNG", optimize=True)
    # High quality JPEG — LinkedIn recompresses; start sharp.
    img.convert("RGB").save(jpg, "JPEG", quality=95, optimize=True, subsampling=0)
    print(f"wrote {png.name} {png.stat().st_size}B · {jpg.name} {jpg.stat().st_size}B · {img.size}")


def write_agents(f: dict[str, ImageFont.ImageFont]) -> None:
    img = base_canvas()
    draw = ImageDraw.Draw(img)
    draw_mark(draw, S(72), S(64), S(120))
    draw.text((S(220), S(95)), "Un-Default", fill="#1a1f2e", font=f["brand"])
    draw.text((S(72), S(220)), "After Claude writes UI copy,", fill="#1a1f2e", font=f["title"])
    draw.text((S(72), S(300)), "run this.", fill="#1a1f2e", font=f["title"])
    draw.text(
        (S(72), S(395)),
        "Local inclusive-language check for agent workflows.",
        fill="#3d4558",
        font=f["body"],
    )
    chip(draw, "npx -y anti-default init", f["mono"], S(460))
    draw.text((S(72), S(555)), "darkai.ca/un-default/for-agents", fill="#2a7a6e", font=f["small"])
    band(draw)
    save_pair(img, "og-for-agents")


def write_home(f: dict[str, ImageFont.ImageFont]) -> None:
    img = base_canvas()
    draw = ImageDraw.Draw(img)
    draw_mark(draw, S(72), S(64), S(120))
    draw.text((S(220), S(95)), "Un-Default", fill="#1a1f2e", font=f["brand"])
    draw.text((S(72), S(220)), "Inclusive language review", fill="#1a1f2e", font=f["title"])
    draw.text((S(72), S(300)), "for AI-written copy.", fill="#1a1f2e", font=f["title"])
    draw.text(
        (S(72), S(395)),
        "Catch colonial, gendered, and ableist defaults — locally.",
        fill="#3d4558",
        font=f["body"],
    )
    chip(draw, "npx -y anti-default init", f["mono"], S(460))
    draw.text((S(72), S(555)), "darkai.ca/un-default", fill="#2a7a6e", font=f["small"])
    band(draw)
    save_pair(img, "og")


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    f = fonts()
    write_agents(f)
    write_home(f)


if __name__ == "__main__":
    main()
