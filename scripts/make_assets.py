#!/usr/bin/env python3
"""Generate lightweight bitmap assets used by the static app."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "img" / "forecast-pitch.png"
ICON_192 = ROOT / "assets" / "img" / "icon-192.png"
ICON_512 = ROOT / "assets" / "img" / "icon-512.png"


def main() -> None:
    width, height = 1400, 620
    img = Image.new("RGB", (width, height), "#123f35")
    draw = ImageDraw.Draw(img, "RGBA")

    for y in range(height):
        ratio = y / height
        r = int(18 + 10 * ratio)
        g = int(63 + 38 * ratio)
        b = int(53 + 34 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    stripe_w = 90
    for x in range(-stripe_w, width + stripe_w, stripe_w * 2):
        draw.rectangle([x, 0, x + stripe_w, height], fill=(255, 255, 255, 10))

    margin = 70
    line = (236, 255, 245, 112)
    draw.rectangle([margin, margin, width - margin, height - margin], outline=line, width=4)
    draw.line([(width // 2, margin), (width // 2, height - margin)], fill=line, width=4)
    draw.ellipse([width // 2 - 85, height // 2 - 85, width // 2 + 85, height // 2 + 85], outline=line, width=4)
    draw.rectangle([margin, height // 2 - 130, margin + 170, height // 2 + 130], outline=line, width=4)
    draw.rectangle([width - margin - 170, height // 2 - 130, width - margin, height // 2 + 130], outline=line, width=4)

    accent = (249, 181, 73, 170)
    blue = (64, 156, 255, 145)
    red = (231, 84, 90, 145)
    points = [
        (230, 200, 28, accent),
        (410, 395, 42, blue),
        (620, 250, 33, red),
        (820, 365, 52, accent),
        (1030, 210, 36, blue),
        (1190, 420, 26, red),
    ]
    for x, y, radius, color in points:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=color)
        draw.ellipse([x - radius * 2, y - radius * 2, x + radius * 2, y + radius * 2], outline=color, width=2)

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay, "RGBA")
    odraw.rectangle([0, 0, width, height], fill=(4, 19, 22, 35))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).filter(ImageFilter.SMOOTH_MORE)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT, quality=88, optimize=True)
    for path, size in [(ICON_192, 192), (ICON_512, 512)]:
        icon = Image.new("RGB", (size, size), "#0f5a4a")
        idraw = ImageDraw.Draw(icon, "RGBA")
        idraw.rectangle([0, 0, size, size], fill="#0f5a4a")
        idraw.ellipse([size * 0.18, size * 0.18, size * 0.82, size * 0.82], fill=(242, 201, 107, 255))
        idraw.ellipse([size * 0.30, size * 0.30, size * 0.70, size * 0.70], fill=(255, 255, 255, 230))
        idraw.rectangle([size * 0.47, size * 0.15, size * 0.53, size * 0.85], fill=(15, 90, 74, 180))
        idraw.rectangle([size * 0.15, size * 0.47, size * 0.85, size * 0.53], fill=(15, 90, 74, 180))
        icon.save(path, quality=92, optimize=True)
    print(OUT)


if __name__ == "__main__":
    main()
