"""Create a 10-second promotional GIF for the public web app.

The output uses 40 frames at 4 FPS and is intended for social media sharing.
It captures the public GitHub Pages app with a localStorage demo user so the
registration gate does not cover the interface.
"""

from __future__ import annotations

import argparse
import io
import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASE_URL = "https://diegomezapy.github.io/copa_mundial_probabilidades/"
OUTPUT_PATH = ROOT / "assets" / "social" / "mundial_probabilidades_demo_10s_4fps.gif"
FRAME_DIR = ROOT / "tmp" / "social_gif_frames"
FPS = 4
TOTAL_SECONDS = 10
FRAME_COUNT = FPS * TOTAL_SECONDS
FRAME_DURATION_MS = int(1000 / FPS)
CAPTURE_SIZE = (1280, 720)
OUTPUT_SIZE = (960, 540)


@dataclass(frozen=True)
class Shot:
    view: str
    title: str
    subtitle: str
    scroll: str = "workbench"
    action: str = ""


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


FONT_TITLE = font(24, bold=True)
FONT_SUBTITLE = font(16)
FONT_SMALL = font(13, bold=True)


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
        "accepted_terms_version": "0.2.12",
        "visit_count": 1,
    }


def app_url(base_url: str, view: str, index: int) -> str:
    return f"{base_url.rstrip('/')}/?view={view}&social_gif={index:02d}"


def wait_app(page: Page, view: str) -> None:
    page.wait_for_selector("#appShell:not(.loading)", timeout=25_000)
    page.wait_for_selector(f"#{view}.view.active", timeout=15_000)
    page.wait_for_timeout(500)


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
        page.wait_for_timeout(400)
    elif action == "hover_team":
        page.locator('.team-card.has-rich-popover[data-kind="team"]').first.hover()
        page.wait_for_timeout(500)
    elif action == "hover_player":
        page.locator('tr.has-rich-popover[data-kind="player"]').first.hover()
        page.wait_for_timeout(500)
    elif action == "hover_prob":
        page.locator('#partidos [data-glossary="prob_1x2"]').first.hover()
        page.wait_for_timeout(500)
    elif action.startswith("wall_scroll:"):
        amount = int(action.split(":", 1)[1])
        page.evaluate("(x) => { const el = document.querySelector('#tournamentWall'); if (el) el.scrollLeft = x; }", amount)
        page.wait_for_timeout(400)
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


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj: ImageFont.ImageFont, max_width: int) -> list[str]:
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
    return lines[:2]


def overlay_frame(base: Image.Image, shot: Shot, frame_index: int) -> Image.Image:
    frame = base.convert("RGBA")
    layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    w, h = frame.size

    margin = 22
    box_w = min(660, w - margin * 2)
    title_lines = wrap_text(draw, shot.title, FONT_TITLE, box_w - 36)
    subtitle_lines = wrap_text(draw, shot.subtitle, FONT_SUBTITLE, box_w - 36)
    box_h = 64 + 24 * (len(title_lines) - 1) + 20 * len(subtitle_lines)
    x0, y0 = margin, h - box_h - margin
    x1, y1 = x0 + box_w, y0 + box_h

    draw.rounded_rectangle((x0, y0, x1, y1), radius=16, fill=(7, 20, 18, 218))
    draw.rectangle((x0, y1 - 7, x1, y1), fill=(15, 118, 110, 235))
    progress = (frame_index + 1) / FRAME_COUNT
    draw.rectangle((x0, y1 - 7, x0 + int(box_w * progress), y1), fill=(245, 158, 11, 245))

    text_y = y0 + 15
    for line in title_lines:
        draw.text((x0 + 18, text_y), line, font=FONT_TITLE, fill=(255, 255, 255, 255))
        text_y += 27
    for line in subtitle_lines:
        draw.text((x0 + 18, text_y + 2), line, font=FONT_SUBTITLE, fill=(220, 252, 231, 245))
        text_y += 20

    badge = f"{frame_index + 1:02d}/40 - 4 fps"
    badge_bbox = draw.textbbox((0, 0), badge, font=FONT_SMALL)
    badge_w = badge_bbox[2] - badge_bbox[0] + 22
    draw.rounded_rectangle((w - badge_w - margin, margin, w - margin, margin + 30), radius=15, fill=(255, 255, 255, 230))
    draw.text((w - badge_w - margin + 11, margin + 7), badge, font=FONT_SMALL, fill=(15, 23, 42, 255))

    # Small moving dot to avoid repeated frames being optimized away.
    dot_x = margin + int((w - margin * 2) * ((frame_index % FPS) / max(1, FPS - 1)))
    draw.ellipse((dot_x - 5, margin + 42, dot_x + 5, margin + 52), fill=(245, 158, 11, 235))

    return Image.alpha_composite(frame, layer).convert("P", palette=Image.Palette.ADAPTIVE, colors=128)


def expand_shots() -> list[Shot]:
    base_shots = [
        Shot("resumen", "Modelo vivo con datos abiertos", "KPIs, partidos, fecha de datos y foco academico.", "top"),
        Shot("resumen", "Filtros didacticos por grupo y pais", "El tablero se recalcula al elegir grupos, equipos o estados.", "workbench", "filter_group_d"),
        Shot("equipos", "Equipos con rating y probabilidades", "Banderas, avance de grupo, ataque, defensa y fichas emergentes.", "workbench", "hover_team"),
        Shot("jugadores", "Jugadores y planteles explorables", "Tabla filtrable, fotos curadas cuando hay fuente libre y ficha contextual.", "workbench", "hover_player"),
        Shot("partidos", "Pronosticos claros: 1, X y 2", "Notas emergentes explican cada concepto sin lenguaje de apuestas.", "workbench", "hover_prob"),
        Shot("mapa", "Mural completo del torneo", "Grupos A-L y llave central en una lamina navegable.", "#mapa", "wall_scroll:0"),
        Shot("mapa", "Llave eliminatoria central", "Cruces por completar, final, tercer puesto y filtros por atenuacion.", "#mapa", "wall_scroll:740"),
        Shot("evidencia", "Evidencia historica filtrable", "Copas pasadas, paises, jugadores y patrones para aprender estadistica.", "workbench"),
        Shot("modelo", "Modelo bayesiano explicable", "Prior, posterior, simulacion, supuestos e intervalos creibles.", "workbench"),
        Shot("acerta", "Acerta tus pronosticos", "Cada usuario guarda aciertos y fallas para aprender con los resultados.", "workbench"),
    ]
    shots: list[Shot] = []
    for shot in base_shots:
        shots.extend([shot] * FPS)
    # The last second alternates authors and references while keeping 40 frames.
    shots[-4:] = [
        Shot("autores", "Autores y colaboracion academica", "Perfil de autores, trazabilidad y proposito educativo.", "workbench"),
        Shot("autores", "Autores y colaboracion academica", "Perfil de autores, trazabilidad y proposito educativo.", "workbench"),
        Shot("referencias", "Fuentes y derechos de uso", "Enlaces, datos abiertos y atribucion para uso responsable.", "workbench", "references_bottom"),
        Shot("referencias", "Fuentes y derechos de uso", "Enlaces, datos abiertos y atribucion para uso responsable.", "workbench", "references_bottom"),
    ]
    return shots[:FRAME_COUNT]


def build_gif(base_url: str, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    shots = expand_shots()
    frames: list[Image.Image] = []
    cache: dict[tuple[str, str, str], Image.Image] = {}
    user_script = f"localStorage.setItem('mundialProbabilidades.user.v1', JSON.stringify({json.dumps(make_user())}));"

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": CAPTURE_SIZE[0], "height": CAPTURE_SIZE[1]}, device_scale_factor=1)
        page = context.new_page()
        page.add_init_script(user_script)
        for index, shot in enumerate(shots):
            key = (shot.view, shot.scroll, shot.action)
            if key not in cache:
                cache[key] = capture_shot(page, base_url, shot, index)
                cache[key].save(FRAME_DIR / f"shot_{len(cache):02d}_{shot.view}.jpg", quality=86)
            frames.append(overlay_frame(cache[key], shot, index))
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Create the social media GIF for the Mundial Probabilidades app.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Public or local app URL.")
    parser.add_argument("--output", default=str(OUTPUT_PATH), help="GIF output path.")
    args = parser.parse_args()
    output = Path(args.output)
    build_gif(args.base_url, output)
    size_mb = output.stat().st_size / (1024 * 1024)
    with Image.open(output) as gif:
      print(json.dumps({"output": str(output), "frames": gif.n_frames, "fps": FPS, "seconds": TOTAL_SECONDS, "size_mb": round(size_mb, 2)}, indent=2))


if __name__ == "__main__":
    main()
