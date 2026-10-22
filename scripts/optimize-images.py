#!/usr/bin/env python3
"""Optimiza las fotos del proyecto a WebP para public/img/.

Los originales viven en assets/evidencia y assets/producto (no se sirven). El
sitio es estático y sin build, así que los WebP generados se versionan y se
publican tal cual.

Uso:
    make images
    python3 scripts/optimize-images.py

Requiere Pillow.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCES = (
    ("evidencia", ROOT / "assets" / "evidencia"),
    ("producto", ROOT / "assets" / "producto"),
)
WIDTHS = (1600, 800)
QUALITY = 82


def targets(width: int) -> list[int]:
    """Anchos a generar sin ampliar la imagen original."""
    result = []
    for candidate in WIDTHS:
        target = min(candidate, width)
        if target not in result:
            result.append(target)
    return result


def main() -> int:
    total = 0
    for folder, source in SOURCES:
        if not source.is_dir():
            print(f"ERROR: falta la carpeta {source.relative_to(ROOT)}", file=sys.stderr)
            return 1

        photos = sorted(
            path
            for path in source.iterdir()
            if path.suffix.lower() in {".jpg", ".jpeg", ".png"} and path.is_file()
        )
        if not photos:
            print(f"ERROR: no hay fotos en {source.relative_to(ROOT)}", file=sys.stderr)
            return 1

        destination = ROOT / "public" / "img" / folder
        destination.mkdir(parents=True, exist_ok=True)
        for path in photos:
            with Image.open(path) as opened:
                image = opened.convert("RGB")
                for width in targets(image.width):
                    height = round(image.height * width / image.width)
                    resized = image if width == image.width else image.resize((width, height))
                    output = destination / f"{path.stem}-{width}.webp"
                    resized.save(output, "WEBP", quality=QUALITY, method=6)
                    size = output.stat().st_size // 1024
                    print(
                        f"{output.relative_to(ROOT)}  {width}x{height}  {size} KB"
                    )
                    total += 1

    print(f"Listo: {total} archivos WebP.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
