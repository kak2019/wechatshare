import {
  LOGIC_GRID_COLS,
  TILE_TYPES,
  TUTORIAL_LAYOUT,
  getLevelDifficulty,
} from "@/content/yanglegeyang";
import type { BoardTile } from "@/lib/yanglegeyang/types";

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dailySeedString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultLevelSeed(levelId: number, daily = dailySeedString()): string {
  return `${levelId}:${daily}`;
}

/** mulberry32 PRNG */
export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uid(prefix: string, i: number) {
  return `${prefix}-${i}`;
}

function shuffleInPlace<T>(arr: T[], rand: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}

function assignTypes(count: number, typeCount: number, rand: () => number): string[] {
  const pool = TILE_TYPES.slice(0, typeCount).map((t) => t.id);
  const types: string[] = [];
  let remaining = count;
  while (remaining > 0) {
    const typeId = pool[Math.floor(rand() * pool.length)]!;
    const chunk = Math.min(3, remaining);
    for (let i = 0; i < chunk; i++) types.push(typeId);
    remaining -= chunk;
  }
  shuffleInPlace(types, rand);
  return types;
}

function tileRect(x: number, y: number) {
  return { left: x, top: y, right: x + 2, bottom: y + 2 };
}

function overlaps(a: ReturnType<typeof tileRect>, b: ReturnType<typeof tileRect>) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function generateTutorialBoard(seed: string): BoardTile[] {
  const rand = mulberry32(hashSeed(seed));
  const types = assignTypes(TUTORIAL_LAYOUT.length, 4, rand);
  return TUTORIAL_LAYOUT.map((pos, i) => ({
    uid: uid("t", i),
    typeId: types[i]!,
    layer: pos.layer,
    x: pos.x,
    y: pos.y,
    removed: false,
  }));
}

function tryPlaceLayer(
  layer: number,
  count: number,
  jitter: number,
  lowerTiles: BoardTile[],
  rand: () => number,
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const maxX = LOGIC_GRID_COLS - 2;
  const maxY = 8;
  let attempts = 0;

  while (positions.length < count && attempts < count * 80) {
    attempts++;
    const x = Math.round(rand() * maxX * 2) / 2 + (rand() - 0.5) * jitter;
    const y = Math.round(rand() * maxY * 2) / 2 + (rand() - 0.5) * jitter;
    const clampedX = Math.max(0, Math.min(maxX, x));
    const clampedY = Math.max(0, Math.min(maxY, y));
    const rect = tileRect(clampedX, clampedY);

    if (layer === 0) {
      positions.push({ x: clampedX, y: clampedY });
      continue;
    }

    const touchesLower = lowerTiles.some((t) => overlaps(rect, tileRect(t.x, t.y)));
    if (!touchesLower) continue;

    const dup = positions.some((p) => overlaps(rect, tileRect(p.x, p.y)));
    if (dup) continue;

    positions.push({ x: clampedX, y: clampedY });
  }

  return positions;
}

function generateProceduralBoard(levelId: number, seed: string): BoardTile[] {
  const diff = getLevelDifficulty(levelId);
  const layers =
    diff.tilesPerLayer.length > 0
      ? diff.tilesPerLayer.length
      : diff.layers;

  const tilesPerLayer =
    diff.tilesPerLayer.length > 0
      ? diff.tilesPerLayer
      : Array.from({ length: layers }, (_, i) => 6 + Math.floor(i * 1.2));

  for (let attempt = 0; attempt < 10; attempt++) {
    const attemptSeed = `${seed}:${attempt}`;
    const rand = mulberry32(hashSeed(attemptSeed));
    const board: BoardTile[] = [];
    let idx = 0;
    let failed = false;

    for (let layer = 0; layer < layers; layer++) {
      const count = tilesPerLayer[layer] ?? 6;
      const lower = board.filter((t) => t.layer < layer);
      const positions = tryPlaceLayer(layer, count, diff.jitter, lower, rand);
      if (positions.length < count) {
        failed = true;
        break;
      }

      for (const pos of positions) {
        board.push({
          uid: uid(`L${layer}`, idx++),
          typeId: "placeholder",
          layer,
          x: pos.x,
          y: pos.y,
          removed: false,
        });
      }
    }

    if (failed) continue;

    const total = board.length;
    if (total === 0 || total % 3 !== 0) continue;

    const types = assignTypes(total, diff.typeCount, rand);
    board.forEach((t, i) => {
      t.typeId = types[i]!;
    });

    return board;
  }

  return generateTutorialBoard(seed);
}

export function generateLevel(levelId: number, seed?: string): { board: BoardTile[]; seed: string } {
  const actualSeed = seed ?? defaultLevelSeed(levelId);
  if (levelId <= 1) {
    return { board: generateTutorialBoard(actualSeed), seed: actualSeed };
  }
  return { board: generateProceduralBoard(levelId, actualSeed), seed: actualSeed };
}

export function getBoardBounds(board: BoardTile[]) {
  let maxX = LOGIC_GRID_COLS;
  let maxY = 6;
  for (const t of board) {
    if (t.removed) continue;
    maxX = Math.max(maxX, t.x + 2);
    maxY = Math.max(maxY, t.y + 2);
  }
  return { width: maxX, height: maxY };
}
