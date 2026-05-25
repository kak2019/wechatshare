import {
  LOGIC_GRID_COLS,
  TILE_TYPES,
  TUTORIAL_LAYOUT,
  normalizeLevelId,
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

/** round = 已通关轮数，每轮第二关布局不同 */
export function defaultLevelSeed(levelId: number, daily = dailySeedString(), round = 0): string {
  const level = normalizeLevelId(levelId);
  return `${level}:${daily}:r${round}`;
}

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

function boardFromLayout(
  layout: { layer: number; x: number; y: number }[],
  seed: string,
  hard: boolean,
  typeCount: number,
): BoardTile[] {
  const rand = mulberry32(hashSeed(seed));
  const types = hard ? assignTypesHard(layout.length, rand) : assignTypesEasy(layout.length, typeCount, rand);
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

export function generateLevel(levelId: number, seed?: string): { board: BoardTile[]; seed: string } {
  const level = normalizeLevelId(levelId);
  const actualSeed = seed ?? defaultLevelSeed(level);
  if (level === 1) {
    return { board: generateTutorialBoard(actualSeed), seed: actualSeed };
  }
  return { board: generateLevel2Board(actualSeed), seed: actualSeed };
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
