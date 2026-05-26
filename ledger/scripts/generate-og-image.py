#!/usr/bin/env python3
"""Generate 1200x630 og-image.png for social link previews (Facebook, iMessage, etc.)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUT = PUBLIC / "og-image.png"
SHIELD = PUBLIC / "shield-icon.png"

W, H = 1200, 630
BLUE = (46, 74, 107)
GREEN = (102, 163, 63)
SLATE = (100, 116, 139)
DARK = (15, 23, 42)
RED = (239, 68, 68)


def _font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def main() -> None:
    img = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Soft gradient background
    for y in range(H):
        t = y / max(H - 1, 1)
        r = int(248 + (255 - 248) * t)
        g = int(250 + (255 - 250) * t)
        b = int(252 + (255 - 252) * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Accent circles
    draw.ellipse((W - 180, 20, W - 20, 180), fill=(254, 226, 226))
    draw.ellipse((W - 120, 60, W - 40, 140), fill=(254, 202, 202))

    pad_x = 80
    y = 88

    if SHIELD.exists():
        shield = Image.open(SHIELD).convert("RGBA")
        shield_h = 72
        shield_w = int(shield.width * (shield_h / shield.height))
        shield = shield.resize((shield_w, shield_h), Image.Resampling.LANCZOS)
        img.paste(shield, (pad_x, y - 8), shield)
        text_x = pad_x + shield_w + 20
    else:
        text_x = pad_x

    f_brand = _font(36, bold=True)
    f_title = _font(64, bold=True)
    f_sub = _font(40)
    f_tag = _font(32)
    f_line = _font(36)

    # ProtectOnt.ca
    draw.text((text_x, y), "Protect", font=f_brand, fill=BLUE)
    w_protect = draw.textlength("Protect", font=f_brand)
    draw.text((text_x + w_protect, y), "Ont", font=f_brand, fill=GREEN)
    w_ont = draw.textlength("Ont", font=f_brand)
    draw.text((text_x + w_protect + w_ont, y), ".ca", font=f_brand, fill=BLUE)

    y += 78
    draw.text((pad_x, y), "Protect ", font=f_title, fill=BLUE)
    w_p = draw.textlength("Protect ", font=f_title)
    draw.text((pad_x + w_p, y), "Ontario", font=f_title, fill=GREEN)

    y += 88
    draw.text((pad_x, y), "Public accountability in Ontario", font=f_sub, fill=SLATE)

    y += 72
    draw.text((pad_x, y), "Public money.", font=f_line, fill=DARK)
    y += 52
    draw.text((pad_x, y), "Private delivery.", font=f_line, fill=RED)

    y += 72
    draw.text((pad_x, y), "Track spending, protests, and policy — protectont.ca", font=f_tag, fill=SLATE)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
