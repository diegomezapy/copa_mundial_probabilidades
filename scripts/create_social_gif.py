"""Create a 10-second promotional GIF for the public web app.

The output uses 40 frames at 4 FPS and is intended for social media sharing.
It captures the public GitHub Pages app with a localStorage demo user so the
registration gate does not cover the interface, then adds a compact story layer:
cover, feature highlights, motion cue, progress bar and final call to action.
"""

from __future__ import annotations

import argparse
import io
import json
import math
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont
from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASE_URL = "https://diegomezapy.github.io/copa_mundial_probabilidades/"
OUTPUT_PATH = ROOT / "assets" / "social" / "mundial_probabilidades_demo_10s_4fps.gif"
PREVIEW_PATH = ROOT / "assets" / "social" / "mundial_probabilidades_demo_10s_4fps_preview.jpg"
FRAME_DIR = ROOT / "tmp" / "social_gif_frames"
CONTACT_SHEET_PATH = ROOT / "tmp" / "social_gif_contact_sheet.jpg"
HERO_IMAGE = ROOT / "assets" / "img" / "generated" / "hero-bayes-football-1920x1080.jpg"
CLASSROOM_IMAGE = ROOT / "assets" / "img" / "generated" / "classroom-football-statistics-1600x900.jpg"
BALL_IMAGE = ROOT / "assets" / "img" / "generated" / "ball-realistic-transparent-1024.png"
FPS = 4
TOTAL_SECONDS = 10
FRAME_COUNT = FPS * TOTAL_SECONDS
FRAME_DURATION_MS = int(1000 / FPS)
CAPTURE_SIZE = (1280, 720)
OUTPUT_SIZE = (960, 540)
URL_TEXT = "diegomezapy.github.io/copa_mundial_probabilidades"
APP_VERSION = "0.2.13"


@dataclass(frozen=True)
class Shot:
    kind: str
    title: str
    subtitle: str
    view: str = "resumen"
    scroll: str = "workbench"
    action: str = ""
    accent: tuple[int, int, int] = (245, 158, 11)
    highlight: tuple[float, float, float, float] | None = None


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


FONT_HERO = font(48, bold=True)
FONT_HERO_SMALL = font(21)
FONT_TITLE = font(27, bold=True)
FONT_SUBTITLE = font(17)
FONT_SMALL = font(13, bold=True)
FONT_TINY = font(11)


def make_user() -> dict[str, object]:
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": "usr_social_gif",
        "username": "demo",
        "name": "Demo social",
        "country": "Paraguay",
        "role": "estudiante",
        "institution": "FACEN",
        "created_at": now,
        "last_seen_at": now,
        "accepted_terms_at": now,
        "accepted_terms_version": APP_VERSION,
        "visit_count": 1,
    }


def app_url(base_url: str, view: str, index: int) -> str:
    return f"{base_url.rstrip('/')}/?view={view}&social_gif={index:02d}&v={APP_VERSION}"


def load_cover_image(path: Path) -> Image.Image:
    if path.exists():
        return Image.open(path).convert("RGB")
    return Image.new("RGB", OUTPUT_SIZE, (12, 38, 34))


def cover_crop(image: Image.Image, zoom: float = 1.0, pan: float = 0.5) -> Image.Image:
    target_w, target_h = OUTPUT_SIZE
    scale = max(target_w / image.width, target_h / image.height) * zoom
    resized = image.resize((int(image.width * scale), int(image.height * scale)), Image.Resampling.LANCZOS)
    max_x = max(0, resized.width - target_w)
    max_y = max(0, resized.height - target_h)
    left = int(max_x * min(1, max(0, pan)))
    top = int(max_y * 0.45)
    return resized.crop((left, top, left + target_w, top + target_h))


def wait_app(page: Page, view: str) -> None:
    page.wait_for_selector("#appShell:not(.loading)", timeout=25_000)
    page.wait_for_selector(f"#{view}.view.active", timeout=15_000)
    page.wait_for_timeout(450)


def scroll_to(page: Page, target: str) -> None:
    if target == "top":
        page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
    elif target == "workbench":
        page.evaluate("document.querySelector('.workbench')?.scrollIntoView({ block: 'start' })")
    elif target:
        page.evaluate("(selector) => document.querySelector(selector)?.scrollIntoView({ block: 'start' })", target)
    page.wait_for_timeout(250)


def apply_action(page: Page, action: str) -> None:
    if not action:
        return
    if action == "filter_group_d":
        page.click('[data-group="Group D"]')
        page.wait_for_timeout(450)
    elif action == "reset_after_filter":
        page.click('[data-group="Group D"]')
        page.wait_for_timeout(250)
        page.click("#globalResetFilters")
        page.wait_for_timeout(450)
    elif action == "hover_team":
        page.locator('.team-card.has-rich-popover[data-kind="team"]').first.hover()
        page.wait_for_timeout(550)
    elif action == "hover_player":
        page.locator('tr.has-rich-popover[data-kind="player"]').first.hover()
        page.wait_for_timeout(550)
    elif action == "hover_prob":
        page.locator('#partidos [data-glossary="prob_1x2"]').first.hover()
        page.wait_for_timeout(550)
    elif action.startswith("wall_scroll:"):
        amount = int(action.split(":", 1)[1])
        page.evaluate("(x) => { const el = document.querySelector('#tournamentWall'); if (el) el.scrollLeft = x; }", amount)
        page.wait_for_timeout(450)
    elif action == "references_bottom":
        page.evaluate("document.querySelector('#referencesList')?.scrollIntoView({ block: 'start' })")
        page.wait_for_timeout(300)


def capture_shot(page: Page, base_url: str, shot: Shot, index: int) -> Image.Image:
    page.goto(app_url(base_url, shot.view, index), wait_until="networkidle", timeout=45_000)
    wait_app(page, shot.view)
    scroll_to(page, shot.scroll)
    apply_action(page, shot.action)
    png = page.screenshot(full_page=False)
    image = Image.open(io.BytesIO(png)).convert("RGB")
    return image.resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj: ImageFont.ImageFont, max_width: int, max_lines: int = 2) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:max_lines]


def overlay_gradient(size: tuple[int, int], top_alpha: int = 42, bottom_alpha: int = 160) -> Image.Image:
    w, h = size
    gradient = Image.new("RGBA", size, (0, 0, 0, 0))
    pix = gradient.load()
    for y in range(h):
        alpha = int(top_alpha + (bottom_alpha - top_alpha) * (y / max(1, h - 1)))
        for x in range(w):
            pix[x, y] = (5, 18, 16, alpha)
    return gradient


def rounded_panel(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], accent: tuple[int, int, int]) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle((x0 + 4, y0 + 8, x1 + 4, y1 + 8), radius=18, fill=(0, 0, 0, 58))
    draw.rounded_rectangle(box, radius=18, fill=(6, 20, 18, 226))
    draw.rectangle((x0, y1 - 8, x1, y1), fill=(*accent, 235))


def paste_ball(layer: Image.Image, frame_index: int, progress: float) -> None:
    if not BALL_IMAGE.exists():
        return
    ball = Image.open(BALL_IMAGE).convert("RGBA").resize((52, 52), Image.Resampling.LANCZOS)
    ball = ball.rotate(-frame_index * 24, resample=Image.Resampling.BICUBIC)
    x0 = 30
    x1 = OUTPUT_SIZE[0] - 30
    y = 31 + int(math.sin(frame_index * 0.75) * 4)
    x = int(x0 + (x1 - x0) * progress) - ball.width // 2
    layer.alpha_composite(ball, (x, y))


def draw_timeline(draw: ImageDraw.ImageDraw, frame_index: int, accent: tuple[int, int, int]) -> None:
    w, _ = OUTPUT_SIZE
    progress = (frame_index + 1) / FRAME_COUNT
    x0, x1 = 34, w - 34
    y = 58
    draw.rounded_rectangle((x0, y, x1, y + 7), radius=4, fill=(255, 255, 255, 98))
    draw.rounded_rectangle((x0, y, x0 + int((x1 - x0) * progress), y + 7), radius=4, fill=(*accent, 245))
    for step in range(0, 11):
        sx = x0 + int((x1 - x0) * step / 10)
        fill = (*accent, 255) if step / 10 <= progress else (255, 255, 255, 170)
        draw.ellipse((sx - 4, y - 4, sx + 4, y + 11), fill=fill)


def highlight_area(draw: ImageDraw.ImageDraw, shot: Shot, frame_index: int) -> None:
    if not shot.highlight:
        return
    w, h = OUTPUT_SIZE
    x, y, bw, bh = shot.highlight
    box = (int(x * w), int(y * h), int((x + bw) * w), int((y + bh) * h))
    pulse = 9 + int((math.sin(frame_index * math.pi / 2) + 1) * 5)
    draw.rounded_rectangle(box, radius=14, outline=(*shot.accent, 235), width=4)
    draw.rounded_rectangle(
        (box[0] - pulse, box[1] - pulse, box[2] + pulse, box[3] + pulse),
        radius=18,
        outline=(*shot.accent, 70),
        width=3,
    )


def title_card(shot: Shot, frame_index: int, final: bool = False) -> Image.Image:
    bg = cover_crop(load_cover_image(CLASSROOM_IMAGE if final else HERO_IMAGE), zoom=1.04, pan=0.18 + frame_index * 0.015)
    frame = bg.convert("RGBA")
    frame = ImageEnhance.Color(frame).enhance(0.92)
    frame = ImageEnhance.Contrast(frame).enhance(1.05)
    frame.alpha_composite(overlay_gradient(OUTPUT_SIZE, 90, 205))
    layer = Image.new("RGBA", OUTPUT_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    w, h = OUTPUT_SIZE

    draw.rounded_rectangle((34, 30, 260, 68), radius=19, fill=(255, 255, 255, 226))
    draw.text((50, 40), "Copa Mundial 2026 + Bayes", font=FONT_SMALL, fill=(15, 90, 74, 255))

    title_lines = wrap_text(draw, shot.title, FONT_HERO, 660, max_lines=3)
    y = 145 if not final else 120
    for line in title_lines:
        draw.text((54, y), line, font=FONT_HERO, fill=(255, 255, 255, 255))
        y += 56
    for line in wrap_text(draw, shot.subtitle, FONT_HERO_SMALL, 720, max_lines=3):
        draw.text((58, y + 10), line, font=FONT_HERO_SMALL, fill=(224, 252, 231, 248))
        y += 28

    if final:
        draw.rounded_rectangle((54, 386, 706, 438), radius=24, fill=(255, 255, 255, 232))
        draw.text((76, 402), URL_TEXT, font=FONT_SUBTITLE, fill=(15, 23, 42, 255))
        draw.rounded_rectangle((54, 454, 474, 492), radius=18, fill=(*shot.accent, 235))
        draw.text((73, 464), "Explora, filtra, pronostica y aprende", font=FONT_SMALL, fill=(255, 255, 255, 255))

    progress = (frame_index + 1) / FRAME_COUNT
    draw_timeline(draw, frame_index, shot.accent)
    frame.alpha_composite(layer)
    paste_ball(frame, frame_index, progress)
    return frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=128)


def app_frame(base: Image.Image, shot: Shot, frame_index: int, frame_in_shot: int) -> Image.Image:
    zoom = 1.0 + 0.018 * frame_in_shot
    resized = base.resize((int(base.width * zoom), int(base.height * zoom)), Image.Resampling.LANCZOS)
    max_x = resized.width - OUTPUT_SIZE[0]
    max_y = resized.height - OUTPUT_SIZE[1]
    left = int(max_x * (0.16 + 0.04 * math.sin(frame_index * 0.9))) if max_x > 0 else 0
    top = int(max_y * 0.28) if max_y > 0 else 0
    frame = resized.crop((left, top, left + OUTPUT_SIZE[0], top + OUTPUT_SIZE[1])).convert("RGBA")
    frame = ImageEnhance.Sharpness(frame).enhance(1.06)
    layer = Image.new("RGBA", OUTPUT_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    w, h = OUTPUT_SIZE

    layer.alpha_composite(overlay_gradient(OUTPUT_SIZE, 12, 82))
    highlight_area(draw, shot, frame_index)

    top_chip = f"Laboratorio publico v{APP_VERSION}"
    draw.rounded_rectangle((28, 22, 256, 54), radius=16, fill=(255, 255, 255, 232))
    draw.text((44, 31), top_chip, font=FONT_SMALL, fill=(15, 23, 42, 255))

    badge = f"{frame_index + 1:02d}/40"
    draw.rounded_rectangle((w - 92, 22, w - 28, 54), radius=16, fill=(255, 255, 255, 232))
    draw.text((w - 80, 31), badge, font=FONT_SMALL, fill=(15, 23, 42, 255))

    box_w = min(720, w - 56)
    title_lines = wrap_text(draw, shot.title, FONT_TITLE, box_w - 42, max_lines=2)
    subtitle_lines = wrap_text(draw, shot.subtitle, FONT_SUBTITLE, box_w - 42, max_lines=2)
    box_h = 76 + 26 * (len(title_lines) - 1) + 22 * len(subtitle_lines)
    x0, y0 = 28, h - box_h - 24
    x1, y1 = x0 + box_w, y0 + box_h
    rounded_panel(draw, (x0, y0, x1, y1), shot.accent)
    y_text = y0 + 16
    for line in title_lines:
        draw.text((x0 + 21, y_text), line, font=FONT_TITLE, fill=(255, 255, 255, 255))
        y_text += 31
    for line in subtitle_lines:
        draw.text((x0 + 21, y_text), line, font=FONT_SUBTITLE, fill=(220, 252, 231, 245))
        y_text += 22

    draw_timeline(draw, frame_index, shot.accent)
    progress = (frame_index + 1) / FRAME_COUNT
    draw.text((w - 332, h - 34), URL_TEXT, font=FONT_TINY, fill=(255, 255, 255, 210))
    frame = Image.alpha_composite(frame, layer)
    paste_ball(frame, frame_index, progress)
    return frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=128)


def shots_for_frames() -> list[Shot]:
    segments = [
        Shot(
            "cover",
            "El Mundial tambien puede ensenar estadistica",
            "Una app publica para jugar con datos, Bayes y pronosticos explicables.",
            accent=(20, 184, 166),
        ),
        Shot(
            "app",
            "Datos en movimiento, no certezas magicas",
            "Resultados, equipos, jugadores y simulaciones se actualizan como evidencia.",
            "resumen",
            "top",
            "",
            (245, 158, 11),
            (0.50, 0.16, 0.39, 0.22),
        ),
        Shot(
            "app",
            "Filtra y todo el tablero responde",
            "Grupo, pais, partido, jugador o Copa historica: una sola lectura global.",
            "resumen",
            "workbench",
            "filter_group_d",
            (239, 68, 68),
            (0.03, 0.24, 0.18, 0.54),
        ),
        Shot(
            "app",
            "Equipos y jugadores con fichas didacticas",
            "Banderas, fotos libres cuando existen y estadisticas para explorar.",
            "equipos",
            "workbench",
            "hover_team",
            (124, 58, 237),
            (0.28, 0.22, 0.64, 0.36),
        ),
        Shot(
            "app",
            "1, X y 2 explicado sin lenguaje de apuestas",
            "La app muestra probabilidades, goles esperados y definiciones emergentes.",
            "partidos",
            "workbench",
            "hover_prob",
            (8, 145, 178),
            (0.58, 0.22, 0.33, 0.48),
        ),
        Shot(
            "app",
            "Mapa vivo de grupos y etapas",
            "Nodos rectangulares muestran pendientes, resultados y rutas posibles.",
            "mapa",
            "#mapa",
            "wall_scroll:720",
            (22, 163, 74),
            (0.25, 0.26, 0.56, 0.38),
        ),
        Shot(
            "app",
            "La intuicion se conecta con la historia",
            "Copas pasadas, paises y goleadores ayudan a discutir evidencia.",
            "evidencia",
            "workbench",
            "",
            (217, 119, 6),
            (0.54, 0.13, 0.34, 0.46),
        ),
        Shot(
            "app",
            "Bayes visible: prior, posterior y simulacion",
            "Cada pronostico viene con supuestos, limites e interpretacion.",
            "metodologia",
            "workbench",
            "",
            (37, 99, 235),
            (0.23, 0.22, 0.63, 0.38),
        ),
        Shot(
            "app",
            "Acerta tus pronosticos y aprende del error",
            "Los usuarios pueden guardar aciertos, fallas y evolucion personal.",
            "acerta",
            "workbench",
            "",
            (190, 18, 60),
            (0.26, 0.18, 0.62, 0.46),
        ),
        Shot(
            "cta",
            "Abrilo, compartilo, llevalo al aula",
            "Un experimento publico para aprender modelos multivariados con futbol.",
            accent=(20, 184, 166),
        ),
    ]
    frames: list[Shot] = []
    for segment in segments:
        frames.extend([segment] * FPS)
    return frames[:FRAME_COUNT]


def write_contact_sheet(frames: list[Image.Image]) -> None:
    sample_indexes = list(range(0, FRAME_COUNT, FPS))
    thumb_w, thumb_h = 240, 135
    cols = 2
    rows = math.ceil(len(sample_indexes) / cols)
    sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + 28)), (245, 247, 246))
    draw = ImageDraw.Draw(sheet)
    for n, frame_index in enumerate(sample_indexes):
        img = frames[frame_index].convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = (n % cols) * thumb_w
        y = (n // cols) * (thumb_h + 28)
        sheet.paste(img, (x, y + 24))
        draw.text((x + 8, y + 5), f"Segundo {n + 1}", font=FONT_SMALL, fill=(15, 23, 42))
    CONTACT_SHEET_PATH.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(CONTACT_SHEET_PATH, quality=88)
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(CONTACT_SHEET_PATH, PREVIEW_PATH)


def build_gif(base_url: str, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    shots = shots_for_frames()
    frames: list[Image.Image] = []
    cache: dict[tuple[str, str, str], Image.Image] = {}
    user_script = f"localStorage.setItem('mundialProbabilidades.user.v1', JSON.stringify({json.dumps(make_user())}));"

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": CAPTURE_SIZE[0], "height": CAPTURE_SIZE[1]}, device_scale_factor=1)
        page = context.new_page()
        page.add_init_script(user_script)
        for index, shot in enumerate(shots):
            frame_in_shot = index % FPS
            if shot.kind == "cover":
                frames.append(title_card(shot, index, final=False))
            elif shot.kind == "cta":
                frames.append(title_card(shot, index, final=True))
            else:
                key = (shot.view, shot.scroll, shot.action)
                if key not in cache:
                    cache[key] = capture_shot(page, base_url, shot, index)
                    cache[key].save(FRAME_DIR / f"shot_{len(cache):02d}_{shot.view}.jpg", quality=88)
                frames.append(app_frame(cache[key], shot, index, frame_in_shot))
        browser.close()

    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATION_MS,
        loop=0,
        optimize=True,
        disposal=2,
    )
    write_contact_sheet(frames)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create the social media GIF for the Mundial Probabilidades app.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Public or local app URL.")
    parser.add_argument("--output", default=str(OUTPUT_PATH), help="GIF output path.")
    args = parser.parse_args()
    output = Path(args.output)
    build_gif(args.base_url, output)
    size_mb = output.stat().st_size / (1024 * 1024)
    with Image.open(output) as gif:
        print(
            json.dumps(
                {
                    "output": str(output),
                    "preview": str(PREVIEW_PATH),
                    "frames": gif.n_frames,
                    "fps": FPS,
                    "seconds": TOTAL_SECONDS,
                    "size_mb": round(size_mb, 2),
                },
                indent=2,
            )
        )


if __name__ == "__main__":
    main()
