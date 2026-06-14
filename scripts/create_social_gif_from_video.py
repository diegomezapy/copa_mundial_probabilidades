"""Create a GIF directly from a screen-capture video.

This script does not use storyboard images, generated art, overlays, or
synthetic frames. It trims the provided video to the requested duration and
converts its actual frames to a GIF with an ffmpeg palette pipeline. By default
it compresses all readable source frames into a 14-second, 20 FPS GIF so the
piece covers as much of the source capture as possible without invented images.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "imagenes" / "screen-capture.webm"
DEFAULT_OUTPUT = ROOT / "assets" / "social" / "mundial_probabilidades_screen_capture_14s_fast.gif"
DEFAULT_PREVIEW = ROOT / "assets" / "social" / "mundial_probabilidades_screen_capture_14s_fast_preview.jpg"
DEFAULT_DURATION_SECONDS = 14
DEFAULT_FPS = 20
DEFAULT_WIDTH = 960
DEFAULT_PREVIEW_SECOND = 42
DEFAULT_MAX_COLORS = 96


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def tool_path(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise SystemExit(f"No se encontro {name}. Instalar ffmpeg o agregarlo al PATH.")
    return path


def parse_frame_rate(value: str) -> float:
    if not value or value == "0/0":
        return 0.0
    if "/" in value:
        numerator, denominator = value.split("/", 1)
        denominator_value = float(denominator)
        return float(numerator) / denominator_value if denominator_value else 0.0
    return float(value)


def probe_video(ffprobe: str, source: Path) -> dict[str, object]:
    result = subprocess.run(
        [
            ffprobe,
            "-v",
            "error",
            "-count_frames",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,avg_frame_rate,r_frame_rate,nb_read_frames",
            "-of",
            "json",
            str(source),
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    data = json.loads(result.stdout)
    stream = data["streams"][0]
    frame_rate = parse_frame_rate(stream.get("avg_frame_rate", "")) or parse_frame_rate(stream.get("r_frame_rate", ""))
    frame_count = int(stream.get("nb_read_frames") or 0)
    detected_seconds = frame_count / frame_rate if frame_count and frame_rate else 0.0
    return {
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "avg_frame_rate": stream.get("avg_frame_rate", ""),
        "r_frame_rate": stream.get("r_frame_rate", ""),
        "nb_read_frames": frame_count,
        "detected_seconds": round(detected_seconds, 3),
    }


def target_height(source_width: int, source_height: int, target_width: int) -> int:
    return max(1, round(target_width * source_height / source_width))


def gif_metadata(path: Path) -> dict[str, object]:
    with Image.open(path) as gif:
        durations: list[int] = []
        for index in range(gif.n_frames):
            gif.seek(index)
            durations.append(int(gif.info.get("duration", 0)))
        return {
            "frames": gif.n_frames,
            "size": gif.size,
            "duration_ms": sum(durations),
            "unique_durations": sorted(set(durations)),
            "bytes": path.stat().st_size,
            "size_mb": round(path.stat().st_size / (1024 * 1024), 2),
        }


def image_metadata(path: Path) -> dict[str, object]:
    with Image.open(path) as image:
        return {"size": image.size, "bytes": path.stat().st_size}


def build_gif(
    source: Path,
    output: Path,
    preview: Path,
    duration_seconds: int,
    fps: int,
    width: int,
    preview_second: int,
    source_seconds: float | None,
    max_colors: int,
) -> dict[str, object]:
    ffmpeg = tool_path("ffmpeg")
    ffprobe = tool_path("ffprobe")
    if not source.exists():
        raise SystemExit(f"No existe el video fuente: {source}")

    output.parent.mkdir(parents=True, exist_ok=True)
    preview.parent.mkdir(parents=True, exist_ok=True)

    source_meta = probe_video(ffprobe, source)
    height = target_height(int(source_meta["width"]), int(source_meta["height"]), width)
    frame_count = duration_seconds * fps
    detected_seconds = float(source_meta.get("detected_seconds") or 0)
    source_seconds_used = source_seconds if source_seconds and source_seconds > 0 else detected_seconds
    if not source_seconds_used:
        source_seconds_used = duration_seconds
    speed_factor = max(1.0, source_seconds_used / duration_seconds)
    scale_filter = f"fps={fps},scale={width}:{height}:flags=lanczos,setsar=1"
    filter_complex = (
        f"[0:v]setpts=PTS/{speed_factor:.6f},{scale_filter},split[s0][s1];"
        f"[s0]palettegen=max_colors={max_colors}:stats_mode=diff[p];"
        "[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle"
    )

    gif_command = [
        ffmpeg,
        "-y",
        "-hide_banner",
        "-loglevel",
        "warning",
        "-fflags",
        "+genpts",
    ]
    if source_seconds and source_seconds > 0:
        gif_command.extend(["-t", str(source_seconds)])
    gif_command.extend(
        [
            "-i",
            str(source),
            "-filter_complex",
            filter_complex,
            "-frames:v",
            str(frame_count),
            str(output),
        ]
    )
    run(gif_command)

    preview_at = min(preview_second, max(0, int(source_seconds_used) - 1))
    run(
        [
            ffmpeg,
            "-y",
            "-hide_banner",
            "-loglevel",
            "warning",
            "-ss",
            str(preview_at),
            "-i",
            str(source),
            "-frames:v",
            "1",
            "-update",
            "1",
            "-vf",
            f"scale={width}:{height}:flags=lanczos,setsar=1",
            str(preview),
        ]
    )

    return {
        "source": str(source),
        "source_meta": source_meta,
        "output": str(output),
        "preview": str(preview),
        "duration_seconds": duration_seconds,
        "fps": fps,
        "target_frames": frame_count,
        "source_seconds_used": round(source_seconds_used, 3),
        "speed_factor": round(speed_factor, 3),
        "max_colors": max_colors,
        "gif": gif_metadata(output),
        "preview_meta": image_metadata(preview),
        "source_rule": "video_frames_only_no_storyboard_no_generated_images",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a 14-second GIF from screen-capture.webm.")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Input screen-capture video.")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Output GIF path.")
    parser.add_argument("--preview", default=str(DEFAULT_PREVIEW), help="Preview JPG path.")
    parser.add_argument("--seconds", type=int, default=DEFAULT_DURATION_SECONDS, help="GIF duration in seconds.")
    parser.add_argument("--fps", type=int, default=DEFAULT_FPS, help="Frames per second.")
    parser.add_argument("--width", type=int, default=DEFAULT_WIDTH, help="Output width in pixels.")
    parser.add_argument("--preview-second", type=int, default=DEFAULT_PREVIEW_SECOND, help="Second used for preview frame.")
    parser.add_argument(
        "--source-seconds",
        type=float,
        default=0,
        help="Source seconds to compress into the GIF. Use 0 to fit all readable source frames.",
    )
    parser.add_argument("--max-colors", type=int, default=DEFAULT_MAX_COLORS, help="Palette size for GIF generation.")
    args = parser.parse_args()

    result = build_gif(
        source=Path(args.input),
        output=Path(args.output),
        preview=Path(args.preview),
        duration_seconds=args.seconds,
        fps=args.fps,
        width=args.width,
        preview_second=args.preview_second,
        source_seconds=args.source_seconds,
        max_colors=args.max_colors,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
