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

/** 教学关：仅 N 种牌，每种 3 张 */
function assignTypesEasy(count: number, typeCount: number, rand: () => number): string[] {
  const n = Math.floor(count / 3);
  const pool = TILE_TYPES.slice(0, typeCount).map((t) => t.id);
  const types: string[] = [];
  for (let i = 0; i < n; i++) {
    const typeId = pool[i % pool.length]!;
    for (let j = 0; j < 3; j++) types.push(typeId);
  }
  shuffleInPlace(types, rand);
  return types;
}

/**
 * 高难度：尽量每种牌只出现 3 张，占满槽位时最难三消。
 * 余数部分随机叠加三连，制造「同牌分散」压力。
 */
function assignTypesHard(count: number, rand: () => number): string[] {
  const pool = TILE_TYPES.map((t) => t.id);
  shuffleInPlace(pool, rand);
  const types: string[] = [];
  let pi = 0;
  let remaining = count;
  while (remaining >= 3) {
    const typeId = pool[pi % pool.length]!;
    pi++;
    for (let i = 0; i < 3; i++) types.push(typeId);
    remaining -= 3;
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

function boardFromLayout(
  layout: { layer: number; x: number; y: number }[],
  seed: string,
  hard: boolean,
  typeCount: number,
): BoardTile[] {
  const rand = mulberry32(hashSeed(seed));
  const types = hard
    ? assignTypesHard(layout.length, rand)
    : assignTypesEasy(layout.length, typeCount, rand);
  return layout.map((pos, i) => ({
    uid: uid(hard ? "h" : "t", i),
    typeId: types[i]!,
    layer: pos.layer,
    x: pos.x,
    y: pos.y,
    removed: false,
  }));
}

function generateTutorialBoard(seed: string): BoardTile[] {
  return boardFromLayout(TUTORIAL_LAYOUT, seed, false, 3);
}

/** 第 2 关：54 张、6 层高密度固定布局 */
function generateLevel2HardLayout(): { layer: number; x: number; y: number }[] {
  const positions: { layer: number; x: number; y: number }[] = [];
  const seen = new Set<string>();
  const add = (layer: number, x: number, y: number) => {
    const k = `${layer}:${x.toFixed(2)}:${y.toFixed(2)}`;
    if (seen.has(k)) return;
    seen.add(k);
    positions.push({ layer, x: +x.toFixed(2), y: +y.toFixed(2) });
  };

  for (let i = 0; i < 4; i++) add(0, i * 1.5, 0.5);
  for (let i = 0; i < 4; i++) add(0, i * 1.5 + 0.75, 2);
  for (let i = 0; i < 4; i++) add(0, i * 1.5, 3.5);

  for (let i = 0; i < 3; i++) add(1, i * 1.5 + 0.5, 1);
  for (let i = 0; i < 3; i++) add(1, i * 1.5 + 0.5, 2.5);
  for (let i = 0; i < 3; i++) add(1, i * 1.5 + 0.5, 4);
  add(1, 2.25, 5.25);

  for (let i = 0; i < 3; i++) add(2, i * 1.5 + 0.75, 1.5);
  for (let i = 0; i < 3; i++) add(2, i * 1.5 + 0.75, 3);
  for (let i = 0; i < 3; i++) add(2, i * 1.5 + 0.75, 4.5);
  add(2, 2.25, 0.25);

  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 1.25, 2);
  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 1.25, 3.5);
  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 1.25, 5);
  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 0.5, 0.75);

  for (let i = 0; i < 2; i++) add(4, i * 1.5 + 1.5, 2.25);
  for (let i = 0; i < 2; i++) add(4, i * 1.5 + 1.5, 3.75);
  for (let i = 0; i < 2; i++) add(4, i * 1.5 + 1, 1);
  for (let i = 0; i < 2; i++) add(4, i * 1.5 + 1, 4.75);

  for (let i = 0; i < 3; i++) add(5, i * 1.5 + 0.75, 2.75);
  for (let i = 0; i < 3; i++) add(5, i * 1.5 + 0.75, 4.25);

  return positions;
}

function generateLevel2Board(seed: string): BoardTile[] {
  return boardFromLayout(generateLevel2HardLayout(), seed, true, 12);
}

function tryPlaceLayer(
  layer: number,
  count: number,
  jitter: number,
  lowerTiles: BoardTile[],
  rand: () => number,
  denseStack: boolean,
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const maxX = LOGIC_GRID_COLS - 2;
  const maxY = denseStack ? 10 : 8;
  let attempts = 0;
  const maxAttempts = count * (denseStack ? 120 : 80);

  while (positions.length < count && attempts < maxAttempts) {
    attempts++;
    let x: number;
    let y: number;
    if (denseStack && layer === 0 && positions.length < count) {
      x = (positions.length % 4) * 1.5 + (rand() - 0.5) * jitter;
      y = Math.floor(positions.length / 4) * 1.5 + 0.5 + (rand() - 0.5) * jitter;
    } else {
      x = Math.round(rand() * maxX * 2) / 2 + (rand() - 0.5) * jitter;
      y = Math.round(rand() * maxY * 2) / 2 + (rand() - 0.5) * jitter;
    }
    const clampedX = Math.max(0, Math.min(maxX, x));
    const clampedY = Math.max(0, Math.min(maxY, y));
    const rect = tileRect(clampedX, clampedY);

    if (layer === 0) {
      const dup = positions.some((p) => overlaps(rect, tileRect(p.x, p.y)));
      if (dup) continue;
      positions.push({ x: clampedX, y: clampedY });
      continue;
    }

    const touching = lowerTiles.filter((t) => overlaps(rect, tileRect(t.x, t.y)));
    if (touching.length === 0) continue;
    if (denseStack && touching.length < 1) continue;

    const dup = positions.some((p) => overlaps(rect, tileRect(p.x, p.y)));
    if (dup) continue;

    positions.push({ x: clampedX, y: clampedY });
  }

  return positions;
}


function generateDenseGridBoard(levelId: number, seed: string, tilesPerLayer: number[]): BoardTile[] {
  const rand = mulberry32(hashSeed(seed));
  const layout: { layer: number; x: number; y: number }[] = [];
  tilesPerLayer.forEach((count, layer) => {
    for (let i = 0; i < count; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      layout.push({
        layer,
        x: col * 1.5 + (layer % 2) * 0.25,
        y: row * 1.4 + layer * 0.15,
      });
    }
  });
  return boardFromLayout(layout, seed, true, 12);
}

function generateProceduralBoard(levelId: number, seed: string): BoardTile[] {
  const diff = getLevelDifficulty(levelId);
  const layers =
    diff.tilesPerLayer.length > 0 ? diff.tilesPerLayer.length : diff.layers;

  const tilesPerLayer =
    diff.tilesPerLayer.length > 0
      ? diff.tilesPerLayer
      : Array.from({ length: layers }, (_, i) => 10 + Math.floor(i * 1.5));

  for (let attempt = 0; attempt < 15; attempt++) {
    const attemptSeed = `${seed}:${attempt}`;
    const rand = mulberry32(hashSeed(attemptSeed));
    const board: BoardTile[] = [];
    let idx = 0;
    let failed = false;

    for (let layer = 0; layer < layers; layer++) {
      const count = tilesPerLayer[layer] ?? 10;
      const lower = board.filter((t) => t.layer < layer);
      const positions = tryPlaceLayer(
        layer,
        count,
        diff.jitter,
        lower,
        rand,
        diff.denseStack,
      );
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

    const types = diff.maxTypeSpread
      ? assignTypesHard(total, rand)
      : assignTypesEasy(total, diff.typeCount, rand);
    board.forEach((t, i) => {
      t.typeId = types[i]!;
    });

    return board;
  }

  return generateDenseGridBoard(levelId, `${seed}:fallback`, tilesPerLayer);
}

export function generateLevel(levelId: number, seed?: string): { board: BoardTile[]; seed: string } {
  const actualSeed = seed ?? defaultLevelSeed(levelId);
  if (levelId <= 1) {
    return { board: generateTutorialBoard(actualSeed), seed: actualSeed };
  }
  if (levelId === 2) {
    return { board: generateLevel2Board(actualSeed), seed: actualSeed };
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
