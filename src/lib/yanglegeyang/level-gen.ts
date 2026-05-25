import {
  LOGIC_GRID_COLS,
  LEVEL2_LAYER_BANDS,
  TILE_TYPES,
  TUTORIAL_LAYOUT,
  normalizeLevelId,
} from "@/content/yanglegeyang";
import { getClickableTiles } from "@/lib/yanglegeyang/occlusion";
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

type LayerBand = (typeof LEVEL2_LAYER_BANDS)[number];

function assignEasyBandTypes(
  layout: { layer: number; x: number; y: number }[],
  indices: number[],
  rand: () => number,
): string[] {
  const sorted = [...indices].sort(
    (a, b) => layout[b]!.layer - layout[a]!.layer || a - b,
  );
  const pool = TILE_TYPES.slice(0, 3).map((t) => t.id);
  shuffleInPlace(pool, rand);
  const result: string[] = new Array(indices.length);

  const topCount = Math.min(6, sorted.length);
  const topTypes = [pool[0]!, pool[0]!, pool[0]!, pool[1]!, pool[1]!, pool[1]!];
  shuffleInPlace(topTypes, rand);
  for (let i = 0; i < topCount; i++) {
    const posInIndices = indices.indexOf(sorted[i]!);
    result[posInIndices] = topTypes[i]!;
  }

  const rest = sorted.slice(topCount);
  const restTypes = assignTypesEasy(rest.length, 3, rand);
  rest.forEach((idx, i) => {
    const posInIndices = indices.indexOf(idx);
    result[posInIndices] = restTypes[i]!;
  });

  return result;
}

function assignTypesForBand(
  layout: { layer: number; x: number; y: number }[],
  indices: number[],
  band: LayerBand,
  rand: () => number,
): string[] {
  if (indices.length === 0) return [];
  if (band.mode === "hard") return assignTypesHard(indices.length, rand);
  if (band.mode === "easy") return assignEasyBandTypes(layout, indices, rand);
  return assignTypesEasy(indices.length, band.typeCount, rand);
}

function assignTypesByLayerBands(
  layout: { layer: number; x: number; y: number }[],
  seed: string,
): string[] {
  const rand = mulberry32(hashSeed(seed));
  const typeByIndex: string[] = new Array(layout.length);

  for (const band of LEVEL2_LAYER_BANDS) {
    const layerSet = new Set(band.layers);
    const indices: number[] = [];
    layout.forEach((pos, i) => {
      if (layerSet.has(pos.layer)) indices.push(i);
    });
    const types = assignTypesForBand(layout, indices, band, rand);
    indices.forEach((idx, i) => {
      typeByIndex[idx] = types[i]!;
    });
  }

  return typeByIndex;
}

function layoutToBoard(
  layout: { layer: number; x: number; y: number }[],
  typeByIndex: string[],
  prefix: string,
): BoardTile[] {
  return layout.map((pos, i) => ({
    uid: uid(prefix, i),
    typeId: typeByIndex[i]!,
    layer: pos.layer,
    x: pos.x,
    y: pos.y,
    removed: false,
  }));
}

function boardFromLayoutEasy(
  layout: { layer: number; x: number; y: number }[],
  seed: string,
  typeCount: number,
): BoardTile[] {
  const rand = mulberry32(hashSeed(seed));
  const types = assignTypesEasy(layout.length, typeCount, rand);
  return layoutToBoard(layout, types, "t");
}

function generateTutorialBoard(seed: string): BoardTile[] {
  return boardFromLayoutEasy(TUTORIAL_LAYOUT, seed, 3);
}

/** 第二关布局：顶层稀疏(12) / 中层(18) / 底层密集(24) = 54 张 */
function generateLevel2HardLayout(): { layer: number; x: number; y: number }[] {
  const positions: { layer: number; x: number; y: number }[] = [];
  const seen = new Set<string>();
  const add = (layer: number, x: number, y: number) => {
    const k = `${layer}:${x.toFixed(2)}:${y.toFixed(2)}`;
    if (seen.has(k)) return;
    seen.add(k);
    positions.push({ layer, x: +x.toFixed(2), y: +y.toFixed(2) });
  };

  // L0 底层 — 14 张（hard 区）
  for (let i = 0; i < 4; i++) add(0, i * 1.5, 0.5);
  for (let i = 0; i < 4; i++) add(0, i * 1.5 + 0.75, 2);
  for (let i = 0; i < 4; i++) add(0, i * 1.5, 3.5);
  add(0, 0, 5);
  add(0, 4.5, 5);

  // L1 — 10 张（hard 区）
  for (let i = 0; i < 3; i++) add(1, i * 1.5 + 0.5, 1);
  for (let i = 0; i < 3; i++) add(1, i * 1.5 + 0.5, 2.5);
  for (let i = 0; i < 3; i++) add(1, i * 1.5 + 0.5, 4);
  add(1, 2.25, 5.25);

  // L2 — 10 张（medium）
  for (let i = 0; i < 3; i++) add(2, i * 1.5 + 0.75, 1.5);
  for (let i = 0; i < 3; i++) add(2, i * 1.5 + 0.75, 3);
  for (let i = 0; i < 3; i++) add(2, i * 1.5 + 0.75, 4.5);
  add(2, 2.25, 0.25);

  // L3 — 8 张（medium）
  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 1.25, 2);
  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 1.25, 3.5);
  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 1.25, 5);
  for (let i = 0; i < 2; i++) add(3, i * 1.5 + 0.5, 0.75);

  // L4 — 6 张（easy，比原来稀疏）
  add(4, 0.5, 1.5);
  add(4, 3.5, 1.5);
  add(4, 1.25, 3);
  add(4, 3, 3);
  add(4, 2, 4.5);
  add(4, 0.75, 5.5);

  // L5 — 6 张（easy，分散）
  add(5, 0.25, 2.5);
  add(5, 2.25, 2);
  add(5, 4.25, 2.5);
  add(5, 0.75, 4);
  add(5, 2.25, 4.75);
  add(5, 3.75, 4);

  return positions;
}

/** 开局可点的三连组数（至少 2 组才过关校验） */
function countClickableTripleGroups(board: BoardTile[]): number {
  const clickable = getClickableTiles(board);
  const counts = new Map<string, number>();
  for (const t of clickable) counts.set(t.typeId, (counts.get(t.typeId) ?? 0) + 1);
  let groups = 0;
  for (const c of counts.values()) if (c >= 3) groups++;
  return groups;
}

function generateLevel2Board(seed: string): BoardTile[] {
  const layout = generateLevel2HardLayout();

  for (let attempt = 0; attempt < 5; attempt++) {
    const attemptSeed = `${seed}:a${attempt}`;
    const types = assignTypesByLayerBands(layout, attemptSeed);
    const board = layoutToBoard(layout, types, "h");
    if (countClickableTripleGroups(board) >= 2) return board;
  }

  const types = assignTypesByLayerBands(layout, `${seed}:fallback`);
  return layoutToBoard(layout, types, "h");
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

/** 调试用：统计各层带牌型数 */
export function debugLevel2Stats(board: BoardTile[]) {
  const stats: Record<string, { tiles: number; types: number }> = {};
  for (const band of LEVEL2_LAYER_BANDS) {
    const key = band.mode;
    const layerSet = new Set(band.layers);
    const tiles = board.filter((t) => layerSet.has(t.layer));
    stats[key] = {
      tiles: tiles.length,
      types: new Set(tiles.map((t) => t.typeId)).size,
    };
  }
  return { stats, clickableTriples: countClickableTripleGroups(board) };
}
