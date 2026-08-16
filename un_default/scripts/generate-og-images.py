#!/usr/bin/env python3
"""Regenerate public/og.png and public/og-for-agents.png (1200×630 LinkedIn/OG cards)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
W, H = 1200, 630


def blob(od: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple[int, int, int], alpha: int) -> None:
    for i in range(10, 0, -1):
        a = int(alpha * (i / 10) * 0.4)
        rr = int(r * (1.2 - i * 0.04))
        od.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(*color, a))


def draw_mark(draw: ImageDraw.ImageDraw, mark_x: int, mark_y: int, mark_s: int) -> None:
    draw.rounded_rectangle(
        [mark_x, mark_y, mark_x + mark_s, mark_y + mark_s],
        radius=20,
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
        draw.rectangle([i * bw, H - 12, (i + 1) * bw if i < 4 else W, H], fill=c)


def base_canvas() -> Image.Image:
    img = Image.new("RGB", (W, H), "#f6f1e8")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    blob(od, 160, -20, 460, (196, 92, 74), 85)
    blob(od, 1040, 80, 420, (42, 122, 110), 75)
    blob(od, 780, 580, 380, (74, 93, 138), 50)
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def fonts() -> dict[str, ImageFont.FreeTypeFont | ImageFont.ImageFont]:
    georgia = "/System/Library/Fonts/Supplemental/Georgia.ttf"
    arial = "/Library/Fonts/Arial.ttf"
    menlo = "/System/Library/Fonts/Menlo.ttc"
    return {
        "brand": ImageFont.truetype(georgia, 40),
        "title": ImageFont.truetype(georgia, 68),
        "body": ImageFont.truetype(arial, 30),
        "small": ImageFont.truetype(arial, 24),
        "mono": ImageFont.truetype(menlo, 28),
    }


def chip(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, y: int) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    pad_x, pad_y = 24, 18
    cw = bbox[2] - bbox[0] + pad_x * 2
    ch = bbox[3] - bbox[1] + pad_y * 2
    draw.rounded_rectangle([72, y, 72 + cw, y + ch], radius=14, fill="#1a524a")
    draw.text((72 + pad_x, y + pad_y - 1), text, fill="#f6f1e8", font=font)


def write_agents(f: dict[str, ImageFont.ImageFont]) -> None:
    img = base_canvas()
    draw = ImageDraw.Draw(img)
    draw_mark(draw, 72, 64, 120)
    draw.text((220, 95), "Un-Default", fill="#1a1f2e", font=f["brand"])
    draw.text((72, 220), "After Claude writes UI copy,", fill="#1a1f2e", font=f["title"])
    draw.text((72, 300), "run this.", fill="#1a1f2e", font=f["title"])
    draw.text(
        (72, 395),
        "Local inclusive-language check for agent workflows.",
        fill="#3d4558",
        font=f["body"],
    )
    chip(draw, "npx -y anti-default init", f["mono"], 460)
    draw.text((72, 555), "darkai.ca/un-default/for-agents", fill="#2a7a6e", font=f["small"])
    band(draw)
    out = PUBLIC / "og-for-agents.png"
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


def write_home(f: dict[str, ImageFont.ImageFont]) -> None:
    img = base_canvas()
    draw = ImageDraw.Draw(img)
    draw_mark(draw, 72, 64, 120)
    draw.text((220, 95), "Un-Default", fill="#1a1f2e", font=f["brand"])
    draw.text((72, 220), "Inclusive language review", fill="#1a1f2e", font=f["title"])
    draw.text((72, 300), "for AI-written copy.", fill="#1a1f2e", font=f["title"])
    draw.text(
        (72, 395),
        "Catch colonial, gendered, and ableist defaults — locally.",
        fill="#3d4558",
        font=f["body"],
    )
    chip(draw, "npx -y anti-default init", f["mono"], 460)
    draw.text((72, 555), "darkai.ca/un-default", fill="#2a7a6e", font=f["small"])
    band(draw)
    out = PUBLIC / "og.png"
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    f = fonts()
    write_agents(f)
    write_home(f)


if __name__ == "__main__":
    main()
