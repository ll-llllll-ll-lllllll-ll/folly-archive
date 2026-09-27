from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "mechanics-data.js"

POINT_DIRECTORIES = {
    "tower-tensegrity": "mechanics-assets/works/decayed-tower-scorched-earth/tensegrity-structure",
    "tower-grindstone": "mechanics-assets/works/decayed-tower-scorched-earth/grindstone",
    "tower-theremin": "mechanics-assets/works/decayed-tower-scorched-earth/theremin",
    "heart-ventricle-structure": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure",
    "heart-pressure": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure",
    "heart-electromagnet": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet",
    "exploding-whale-degradation": "mechanics-assets/projects/exploding-whale/environmental-input/degradation",
    "spiral-decay-degradation": "mechanics-assets/projects/spiral-decay/environmental-input/degradation",
    "centrifuge-flute-centrifuge": "mechanics-assets/projects/centrifuge-flute/rotation/centrifuge",
    "dolomite-stonehenge-stone-masonry": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry",
    "ruin-egg-hourglass": "mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass",
    "her-memories-space-debris-point": "mechanics-assets/projects/her-memories/zero-gravity/space-debris",
}

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"}
VIDEO_EXT = {".mp4", ".mov", ".m4v", ".webm", ".ogv"}
AUDIO_EXT = {".wav", ".mp3", ".m4a", ".aac", ".ogg", ".flac"}
TEXT_EXT = {".txt", ".md", ".csv"}
HEIC_EXT = {".heic", ".heif"}

BEGIN = "  /* AUTO_MECHANICS_FILES_BEGIN */"
END = "  /* AUTO_MECHANICS_FILES_END */"


def natural_key(name: str):
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", name)]


def file_type(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in IMAGE_EXT:
        return "image"
    if ext == ".pdf":
        return "pdf"
    if ext in TEXT_EXT:
        return "text"
    if ext in HEIC_EXT:
        return "heic"
    if ext in VIDEO_EXT:
        return "video"
    if ext in AUDIO_EXT:
        return "audio"
    return "file"


def build_index():
    result = {}
    for point_id, rel_dir in POINT_DIRECTORIES.items():
        folder = ROOT / rel_dir
        files = []
        if folder.is_dir():
            for path in sorted((p for p in folder.iterdir() if p.is_file() and not p.name.startswith(".")), key=lambda p: natural_key(p.name)):
                files.append({
                    "src": path.relative_to(ROOT).as_posix(),
                    "filename": path.name,
                    "type": file_type(path),
                })
        result[point_id] = {"directory": rel_dir.rstrip("/") + "/", "files": files}
    return result


def generated_block(index):
    payload = json.dumps(index, ensure_ascii=False, indent=2)
    return f'''{BEGIN}\n  // Generated from the real contents of mechanics-assets/. Do not hand-edit this block.\n  const AUTO_MECHANICS_FILES = {payload};\n\n  const autoMechanicsPointMap = new Map();\n  const indexMechanicsPoints = nodes => (nodes || []).forEach(node => {{\n    autoMechanicsPointMap.set(node.id, node);\n    indexMechanicsPoints(node.children);\n  }});\n  indexMechanicsPoints(works);\n  indexMechanicsPoints(projects);\n\n  // Exploding Whale is intentionally kept as one technical point: 降解.\n  const explodingWhaleProject = projects.find(project => project.id === 'exploding-whale');\n  if (explodingWhaleProject?.children) {{\n    explodingWhaleProject.children = explodingWhaleProject.children.filter(child => child.id !== 'exploding-whale-explosive-release');\n  }}\n\n  Object.entries(AUTO_MECHANICS_FILES).forEach(([pointId, bucket]) => {{\n    const node = autoMechanicsPointMap.get(pointId);\n    if (!node) return;\n    node.directory = bucket.directory;\n    const label = node.label || L(pointId, pointId, pointId);\n    node.records = bucket.files.map((file, index) => R(\n      `${{pointId}}-auto-${{index + 1}}`,\n      L(`${{label.zh || pointId}} · ${{file.filename}}`, `${{label.en || pointId}} · ${{file.filename}}`, `${{label.ja || pointId}} · ${{file.filename}}`),\n      file.src,\n      file.type,\n      L(file.filename, file.filename, file.filename),\n      {{ autoIndexed: true, directory: bucket.directory }}\n    ));\n  }});\n{END}'''


def main():
    source = DATA_FILE.read_text(encoding="utf-8")
    block = generated_block(build_index())
    if BEGIN in source and END in source:
        source = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), block, source, flags=re.S)
    else:
        marker = "  window.RUINWRIGHT_ENGINEERING_ARCHIVE = {"
        if marker not in source:
            raise SystemExit("mechanics-data.js export marker not found")
        source = source.replace(marker, block + "\n\n" + marker, 1)
    DATA_FILE.write_text(source, encoding="utf-8")


if __name__ == "__main__":
    main()
