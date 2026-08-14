#!/usr/bin/env python3
"""Generate Chrome Web Store icons and listing screenshots for Un-Default."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "extension"
ICONS = ROOT / "icons"
STORE = ROOT / "store"
ASSETS = STORE / "assets"

INK = (26, 31, 46)
INK_SOFT = (61, 69, 88)
TEAL = (42, 122, 110)
TEAL_DEEP = (26, 82, 74)
CORAL = (196, 92, 74)
PAPER = (246, 241, 232)
WHITE = (255, 255, 255)
WARN = (184, 134, 11)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = max(1, size // 16)
    draw.rounded_rectangle(
        [pad, pad, size - pad - 1, size - pad - 1],
        radius=max(4, size // 5),
        fill=TEAL_DEEP,
    )
    # accent bar
    bar_h = max(2, size // 10)
    draw.rectangle(
        [pad, size - pad - bar_h * 2, size - pad - 1, size - pad - 1],
        fill=CORAL,
    )
    label = "AD"
    f = font(max(10, int(size * 0.42)), bold=True)
    bbox = draw.textbbox((0, 0), label, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((size - tw) / 2, (size - th) / 2 - size * 0.06),
        label,
        fill=PAPER,
        font=f,
    )
    return img


def screenshot_highlights() -> Image.Image:
    w, h = 1280, 800
    img = Image.new("RGB", (w, h), PAPER)
    draw = ImageDraw.Draw(img)

    # soft atmospheric blobs
    for cx, cy, r, color in [
        (180, 80, 220, (232, 210, 200)),
        (1100, 120, 260, (210, 228, 222)),
        (900, 700, 240, (228, 220, 200)),
    ]:
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(overlay).ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, 180))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

    # browser chrome
    draw.rounded_rectangle([60, 50, 1220, 750], radius=16, fill=WHITE, outline=(220, 214, 204), width=2)
    draw.rounded_rectangle([60, 50, 1220, 110], radius=16, fill=(236, 232, 224))
    draw.rectangle([60, 90, 1220, 110], fill=(236, 232, 224))
    for i, c in enumerate([(224, 108, 98), (230, 180, 80), (110, 180, 120)]):
        draw.ellipse([84 + i * 28, 70, 100 + i * 28, 86], fill=c)
    draw.rounded_rectangle([200, 66, 980, 94], radius=8, fill=WHITE, outline=(210, 205, 196))
    draw.text((220, 72), "https://example.com/careers", fill=INK_SOFT, font=font(16))

    draw.text((100, 140), "Careers", fill=INK, font=font(42, bold=True))
    draw.text(
        (100, 200),
        "Join a team that ships carefully — not just quickly.",
        fill=INK_SOFT,
        font=font(22),
    )

    # body with highlights
    lines = [
        ("We need native English speakers only for this role.", True, False),
        ("Our gurus discovered America-level growth last quarter.", True, False),
        ('A candidate said "guys, this is crazy good culture fit."', True, True),
        ("Prefer fluent English and clear written communication.", False, False),
    ]
    y = 280
    for text, hit, soft in lines:
        if hit:
            bbox = draw.textbbox((100, y), text, font=font(24))
            pad = 6
            color = (255, 236, 200) if soft else (255, 220, 210)
            draw.rounded_rectangle(
                [bbox[0] - pad, bbox[1] - 2, bbox[2] + pad, bbox[3] + 4],
                radius=4,
                fill=color,
            )
        draw.text((100, y), text, fill=INK, font=font(24))
        y += 56

    # toast
    draw.rounded_rectangle([860, 620, 1180, 710], radius=8, fill=TEAL_DEEP)
    draw.text((880, 638), "Un-Default · 4 highlights", fill=PAPER, font=font(18, bold=True))
    draw.text((880, 668), "1 soft-flagged · Open full review", fill=(159, 212, 192), font=font(15))

    # caption strip
    draw.rectangle([0, 760, w, h], fill=TEAL_DEEP)
    draw.text(
        (60, 772),
        "Un-Default — inclusive language highlights on any page  ·  Works offline  ·  No AI calls",
        fill=PAPER,
        font=font(18),
    )
    return img


def screenshot_popup() -> Image.Image:
    w, h = 1280, 800
    img = Image.new("RGB", (w, h), PAPER)
    draw = ImageDraw.Draw(img)

    draw.text((80, 70), "Un-Default", fill=INK, font=font(48, bold=True))
    draw.text(
        (80, 140),
        "A tiny popup. Local rules. Toggle highlights anytime.",
        fill=INK_SOFT,
        font=font(24),
    )

    # fake toolbar
    draw.rounded_rectangle([900, 60, 1200, 120], radius=12, fill=WHITE, outline=(210, 205, 196), width=2)
    draw.ellipse([1100, 78, 1136, 114], fill=TEAL_DEEP)
    draw.text((1108, 86), "AD", fill=PAPER, font=font(14, bold=True))

    # popup card
    draw.rounded_rectangle([420, 240, 860, 560], radius=12, fill=PAPER, outline=TEAL_DEEP, width=3)
    draw.text((460, 280), "Un-Default", fill=INK, font=font(28, bold=True))
    draw.text(
        (460, 330),
        "Highlight inclusive-language\nsuggestions on this page.",
        fill=INK_SOFT,
        font=font(20),
    )
    draw.rounded_rectangle([460, 420, 490, 450], radius=4, fill=TEAL, outline=TEAL_DEEP)
    draw.text((470, 424), "✓", fill=PAPER, font=font(16, bold=True))
    draw.text((510, 424), "Highlights on", fill=INK, font=font(20))
    draw.text((460, 490), "darkai.ca/un-default", fill=TEAL_DEEP, font=font(16))

    draw.rectangle([0, 760, w, h], fill=TEAL_DEEP)
    draw.text(
        (80, 772),
        "No accounts · No tracking · Rules run on your device",
        fill=PAPER,
        font=font(18),
    )
    return img


def promo_tile() -> Image.Image:
    w, h = 440, 280
    img = Image.new("RGB", (w, h), PAPER)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, w, 12], fill=CORAL)
    draw.rectangle([0, h - 12, w, h], fill=TEAL)
    icon = draw_icon(96)
    img.paste(icon, (28, 50), icon)
    draw.text((140, 60), "Un-Default", fill=INK, font=font(32, bold=True))
    draw.text(
        (140, 110),
        "Inclusive language\nhighlights on any page",
        fill=INK_SOFT,
        font=font(18),
    )
    draw.text((140, 190), "Offline · Free · No AI", fill=TEAL_DEEP, font=font(16, bold=True))
    return img


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    for size in (16, 32, 48, 128):
        path = ICONS / f"icon-{size}.png"
        draw_icon(size).save(path, "PNG")
        print(f"wrote {path}")

    shots = {
        "screenshot-1-highlights-1280x800.png": screenshot_highlights(),
        "screenshot-2-popup-1280x800.png": screenshot_popup(),
        "promo-tile-440x280.png": promo_tile(),
    }
    for name, image in shots.items():
        path = ASSETS / name
        image.save(path, "PNG")
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
