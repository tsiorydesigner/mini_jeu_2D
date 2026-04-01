"""
Generateur de niveaux pour Mod Runner (format compatible JS).

Usage:
    python generate_levels.py --levels 10 --width 46 --height 18 --seed 42

Le script affiche un JSON utilisable directement dans `JS/game.js`.
"""

from __future__ import annotations

import argparse
import json
import random
from dataclasses import dataclass


SYMBOLS = {
    "EMPTY": ".",
    "PLATFORM": "#",
    "COIN": "C",
    "ENEMY_WALKER": "E",
    "ENEMY_JUMPER": "J",
    "ENEMY_FLYER": "F",
    "SPIKE": "S",
    "POWERUP": "P",
    "CHECKPOINT": "K",
}


@dataclass
class GenConfig:
    width: int
    height: int
    levels: int
    seed: int | None


def empty_grid(width: int, height: int) -> list[list[str]]:
    return [[SYMBOLS["EMPTY"] for _ in range(width)] for _ in range(height)]


def place_ground(grid: list[list[str]]) -> None:
    h = len(grid)
    w = len(grid[0])
    for y in range(h - 3, h):
        for x in range(w):
            if x % 4 != 3:
                grid[y][x] = SYMBOLS["PLATFORM"]


def place_platforms(grid: list[list[str]], level: int, rnd: random.Random) -> None:
    h = len(grid)
    w = len(grid[0])
    count = 8 + level * 2
    for _ in range(count):
        pw = rnd.randint(3, 7)
        x = rnd.randint(1, max(1, w - pw - 2))
        y = rnd.randint(3, h - 6)
        for i in range(pw):
            grid[y][x + i] = SYMBOLS["PLATFORM"]


def put_if_empty(grid: list[list[str]], x: int, y: int, symbol: str) -> bool:
    if grid[y][x] != SYMBOLS["EMPTY"]:
        return False
    grid[y][x] = symbol
    return True


def place_objects(grid: list[list[str]], level: int, rnd: random.Random) -> None:
    h = len(grid)
    w = len(grid[0])

    # Point de checkpoint unique au milieu
    put_if_empty(grid, w // 2, h - 9, SYMBOLS["CHECKPOINT"])
    put_if_empty(grid, max(2, w // 3), h - 10, SYMBOLS["POWERUP"])

    # Coins
    for _ in range(14 + level * 2):
        x = rnd.randint(1, w - 2)
        y = rnd.randint(2, h - 6)
        put_if_empty(grid, x, y, SYMBOLS["COIN"])

    # Ennemis
    for _ in range(4 + level):
        x = rnd.randint(2, w - 3)
        y = rnd.randint(4, h - 6)
        enemy = rnd.choice(
            [SYMBOLS["ENEMY_WALKER"], SYMBOLS["ENEMY_JUMPER"], SYMBOLS["ENEMY_FLYER"]]
        )
        put_if_empty(grid, x, y, enemy)

    # Piques
    for _ in range(3 + level // 2):
        x = rnd.randint(1, w - 2)
        y = h - 4
        put_if_empty(grid, x, y, SYMBOLS["SPIKE"])


def enforce_spawn_area(grid: list[list[str]]) -> None:
    # Zone de spawn propre en haut-gauche
    for y in range(0, 4):
        for x in range(0, 5):
            if grid[y][x] != SYMBOLS["PLATFORM"]:
                grid[y][x] = SYMBOLS["EMPTY"]


def generate_level(cfg: GenConfig, level: int, rnd: random.Random) -> list[str]:
    grid = empty_grid(cfg.width, cfg.height)
    place_ground(grid)
    place_platforms(grid, level, rnd)
    place_objects(grid, level, rnd)
    enforce_spawn_area(grid)
    return ["".join(row) for row in grid]


def build_output(cfg: GenConfig) -> dict:
    rnd = random.Random(cfg.seed)
    data = []
    for lvl in range(1, cfg.levels + 1):
        data.append(
            {
                "name": f"Niveau {lvl}",
                "coinGoal": min(8 + lvl, 20),
                "enemySpeed": round(1.2 + lvl * 0.1, 2),
                "map": generate_level(cfg, lvl, rnd),
            }
        )
    return {"generatedLevels": data}


def main() -> None:
    parser = argparse.ArgumentParser(description="Generateur de niveaux Mod Runner")
    parser.add_argument("--levels", type=int, default=10, help="Nombre de niveaux")
    parser.add_argument("--width", type=int, default=46, help="Largeur de la map")
    parser.add_argument("--height", type=int, default=18, help="Hauteur de la map")
    parser.add_argument("--seed", type=int, default=None, help="Seed aleatoire")
    args = parser.parse_args()

    cfg = GenConfig(args.width, args.height, args.levels, args.seed)
    out = build_output(cfg)
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
