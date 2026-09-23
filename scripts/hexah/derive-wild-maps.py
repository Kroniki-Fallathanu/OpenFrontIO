"""Hexah "Dzikie Ziemie" arena maps cut from the terrain of existing maps.

Each entry in wild-maps.json names a source map in map-generator/assets/maps,
a crop box and a rotation/mirror, so the result reads as a new land instead of
a recognizable piece of Earth. The script writes the map-generator inputs
(image.png + info.json) for every entry; `go run .` in map-generator then turns
them into the game's map files, exactly like any other map.

Terrain in image.png: blue channel 106 (or alpha < 20) is water, pure black is
impassable, everything else is land whose height is the blue channel mapped
from 140..200 onto 0..30. Scaling works on the decoded terrain, not on the
colours, so a water pixel never blends into a land height.

Usage (needs Pillow and numpy):
  python3 scripts/hexah/derive-wild-maps.py
  npx prettier --write "map-generator/assets/maps/*/info.json"
  cd map-generator && go run . --maps=<folders from wild-maps.json>
"""

import json
import os
import random
import sys

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MAPS = os.path.join(ROOT, "map-generator", "assets", "maps")
SPEC = os.path.join(os.path.dirname(__file__), "wild-maps.json")

WIDTH, HEIGHT = 1600, 1200
NATIONS_PER_MAP = 12
# Spawn points sit this far from any water, so they stay on land when the
# compact variant halves every coordinate.
MIN_WATER_DISTANCE = 14
EDGE_MARGIN = 40

# Nation names travel in a field limited to 27 printable Latin-1 characters
# (tests/NationName.test.ts), so Polish letters outside Latin-1 (ą, ę, ł, ż…)
# stay out of this list; "ó" is in Latin-1 and allowed.
NATION_NAMES = [
    "Osada Brzozowa", "Gród Cierni", "Warownia Cisowa", "Osada Mgielna",
    "Stanica Kruków", "Obóz Wilczy", "Gród Turów", "Osada Wrzosowa",
    "Warownia Skalna", "Osada Bobrów", "Gród Sokoli", "Stanica Jesionowa",
    "Obóz Rysi", "Warownia Grabowa", "Osada Olchowa", "Gród Borów",
    "Stanica Mszysta", "Obóz Borsuczy", "Warownia Modrzewiowa", "Osada Sosnowa",
    "Gród Orli", "Stanica Bursztynowa", "Obóz Lisi", "Warownia Grani",
    "Osada Jaworowa", "Gród Wydrzy", "Stanica Czarnych Wód", "Obóz Kani",
    "Warownia Kamiennych Wrót", "Osada Leszczynowa", "Gród Mglistych Turni",
    "Stanica Sarnia", "Obóz Kruczy", "Warownia Cienista", "Osada Trzcinowa",
    "Gród Srebrnej Rzeki",
]


def decode(name):
    image = Image.open(os.path.join(MAPS, name, "image.png")).convert("RGBA")
    a = np.array(image)
    water = (a[..., 3] < 20) | (a[..., 2] == 106)
    impassable = (a[..., 0] == 0) & (a[..., 1] == 0) & (a[..., 2] == 0) & (a[..., 3] >= 20)
    height = (np.clip(a[..., 2].astype(np.float32), 140, 200) - 140) / 2
    return water, impassable, height


def transform(arr, ops):
    if "r90" in ops:
        arr = np.rot90(arr, 1)
    if "r180" in ops:
        arr = np.rot90(arr, 2)
    if "r270" in ops:
        arr = np.rot90(arr, 3)
    if "fx" in ops:
        arr = arr[:, ::-1]
    if "fy" in ops:
        arr = arr[::-1, :]
    return np.ascontiguousarray(arr)


def resample(arr):
    image = Image.fromarray(arr.astype(np.float32), mode="F")
    return np.array(image.resize((WIDTH, HEIGHT), Image.BILINEAR))


def cut(entry):
    water, impassable, height = decode(entry["src"])
    water, impassable, height = (
        transform(v, entry.get("t", "")) for v in (water, impassable, height)
    )
    x, y, w, h = entry["box"]
    window = (slice(y, y + h), slice(x, x + w))
    water, impassable, height = water[window], impassable[window], height[window]
    # Area-averaged mask with a 0.5 threshold keeps the coastline smooth when
    # the crop is scaled; nearest-neighbour would leave a staircase.
    impassable_out = resample(impassable) >= 0.5
    water_out = (resample(water) >= 0.5) & ~impassable_out
    height_out = resample(np.where(water, 0, height))
    return tuple(
        transform(v, entry.get("post", ""))
        for v in (water_out, impassable_out, height_out)
    )


def encode(water, impassable, height):
    blue = np.clip(140 + height * 2, 140, 200).astype(np.uint8)
    blue[water] = 106
    rgb = np.stack([blue, blue, blue], axis=-1)
    rgb[impassable] = 0
    rgba = np.dstack([rgb, np.full(blue.shape, 255, np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def inland(water, impassable, distance):
    """Land at least `distance` tiles away from water, impassable and edges."""
    land = ~water & ~impassable
    for _ in range(distance):
        shrunk = land.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            shrunk &= np.roll(np.roll(land, dy, 0), dx, 1)
        land = shrunk
    land[:EDGE_MARGIN, :] = False
    land[-EDGE_MARGIN:, :] = False
    land[:, :EDGE_MARGIN] = False
    land[:, -EDGE_MARGIN:] = False
    return land


def spread_points(candidates, count, rng):
    """Farthest-point sampling: every next spawn goes where the others are not."""
    ys, xs = np.nonzero(candidates)
    points = np.stack([xs, ys], axis=1)
    chosen = [points[rng.randrange(len(points))]]
    nearest = np.full(len(points), np.inf)
    for _ in range(count - 1):
        d = np.hypot(*(points - chosen[-1]).T)
        nearest = np.minimum(nearest, d)
        chosen.append(points[int(np.argmax(nearest))])
    return [[int(x), int(y)] for x, y in chosen]


def info_json(entry, water, impassable, height):
    rng = random.Random(entry["folder"])
    # Prefer lowland and hills for spawns; peaks are a poor place to start.
    candidates = inland(water, impassable, MIN_WATER_DISTANCE) & (height < 20)
    names = rng.sample(NATION_NAMES, NATIONS_PER_MAP)
    coords = spread_points(candidates, NATIONS_PER_MAP, rng)
    map_id = "".join(
        part.capitalize()
        for part in entry["folder_id_words"]
    )
    return {
        "id": map_id,
        "name": entry["name"],
        "translation_key": f"map.{entry['folder']}",
        "categories": ["fictional"],
        "multiplayer_frequency": 0,
        "nations": [
            {"coordinates": c, "name": n, "flag": ""} for c, n in zip(coords, names)
        ],
        "themes": ["hexah"],
    }


ASCII = str.maketrans("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ", "acelnoszzACELNOSZZ")


def main():
    spec = json.load(open(SPEC, encoding="utf-8"))
    for entry in spec:
        entry["folder_id_words"] = entry["name"].translate(ASCII).split()
        water, impassable, height = cut(entry)
        if impassable.any():
            sys.exit(f"{entry['name']}: crop touches impassable terrain")
        out = os.path.join(MAPS, entry["folder"])
        os.makedirs(out, exist_ok=True)
        encode(water, impassable, height).save(os.path.join(out, "image.png"))
        with open(os.path.join(out, "info.json"), "w", encoding="utf-8") as f:
            json.dump(info_json(entry, water, impassable, height), f, ensure_ascii=False, indent=2)
            f.write("\n")
        land = float((~water).mean())
        print(f"{entry['folder']}: land {land:.0%}")


if __name__ == "__main__":
    main()
