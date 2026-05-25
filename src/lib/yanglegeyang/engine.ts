import { MAX_DOCK, PROPS_PER_LEVEL, TILE_TYPES, normalizeLevelId } from "@/content/yanglegeyang";
import { generateLevel, defaultLevelSeed, dailySeedString } from "@/lib/yanglegeyang/level-gen";
import { isTileClickable } from "@/lib/yanglegeyang/occlusion";
import type { GamePhase,
  BoardTile,
  GameSnapshot,
  GameState,
  PropsRemaining,
  YangSave,
} from "@/lib/yanglegeyang/types";
import { SAVE_VERSION } from "@/lib/yanglegeyang/types";

function playerId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createNewSave(playerName = "无名羊友"): YangSave {
  const now = Date.now();
  const daily = dailySeedString();
  return {
    version: SAVE_VERSION,
    playerId: playerId(),
    playerName,
    currentLevel: 1,
    bestLevel: 0,
    wins: 0,
    losses: 0,
    totalClears: 0,
    dailySeed: daily,
    levelSeeds: { 1: defaultLevelSeed(1, daily) },
    createdAt: now,
    lastSaved: now,
  };
}

export function migrateSave(raw: Partial<YangSave>): YangSave {
  const base = createNewSave(raw.playerName ?? "无名羊友");
  const merged = {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    levelSeeds: raw.levelSeeds ?? base.levelSeeds,
    dailySeed: raw.dailySeed ?? base.dailySeed,
  };
  merged.currentLevel = normalizeLevelId(merged.currentLevel);
  if ((raw.currentLevel ?? 1) > 2) merged.currentLevel = 1;
  return merged;
}

function freshProps(): PropsRemaining {
  return { ...PROPS_PER_LEVEL };
}

function snapshot(state: GameState): GameSnapshot {
  return {
    board: state.board.map((t) => ({ ...t })),
    dock: [...state.dock],
    stash: [...state.stash],
    propsRemaining: { ...state.propsRemaining },
  };
}

function cloneBoard(board: BoardTile[]): BoardTile[] {
  return board.map((t) => ({ ...t }));
}

export function applyTripleMatch(dock: string[]): string[] {
  const counts = new Map<string, number>();
  for (const id of dock) counts.set(id, (counts.get(id) ?? 0) + 1);

  let toRemove = 0;
  for (const [, c] of counts) {
    if (c >= 3) {
      toRemove = 3;
      break;
    }
  }
  if (toRemove === 0) return dock;

  const target = [...counts.entries()].find(([, c]) => c >= 3)?.[0];
  if (!target) return dock;

  let removed = 0;
  return dock.filter((id) => {
    if (id === target && removed < 3) {
      removed++;
      return false;
    }
    return true;
  });
}

function checkWin(board: BoardTile[], dock: string[], stash: string[]): boolean {
  const remaining = board.some((t) => !t.removed);
  return !remaining && dock.length === 0 && stash.length === 0;
}

function checkLose(dock: string[]): boolean {
  if (dock.length < MAX_DOCK) return false;
  const counts = new Map<string, number>();
  for (const id of dock) counts.set(id, (counts.get(id) ?? 0) + 1);
  return ![...counts.values()].some((c) => c >= 3);
}

export function initLevel(levelId: number, seed?: string): GameState {
  const level = normalizeLevelId(levelId);
  const { board, seed: actualSeed } = generateLevel(level, seed);
  return {
    board,
    dock: [],
    stash: [],
    history: [],
    phase: "playing",
    levelId: level,
    seed: actualSeed,
    propsRemaining: freshProps(),
  };
}

export function pickTile(state: GameState, uid: string): GameState {
  if (state.phase !== "playing") return state;

  const tile = state.board.find((t) => t.uid === uid && !t.removed);
  if (!tile || !isTileClickable(tile, state.board)) return state;

  const history = [...state.history, snapshot(state)];
  const board = cloneBoard(state.board);
  const target = board.find((t) => t.uid === uid)!;
  target.removed = true;

  let dock = [...state.dock, target.typeId];
  dock = applyTripleMatch(dock);

  let phase: GamePhase = state.phase;
  if (checkWin(board, dock, state.stash)) phase = "won";
  else if (checkLose(dock)) phase = "lost";

  return { ...state, board, dock, history, phase };
}

export function usePropUndo(state: GameState): GameState {
  if (state.phase !== "playing" || state.propsRemaining.undo <= 0) return state;
  const prev = state.history[state.history.length - 1];
  if (!prev) return state;

  return {
    ...state,
    board: cloneBoard(prev.board),
    dock: [...prev.dock],
    stash: [...prev.stash],
    propsRemaining: { ...state.propsRemaining, undo: state.propsRemaining.undo - 1 },
    history: state.history.slice(0, -1),
    phase: "playing",
  };
}

export function usePropShuffle(state: GameState): GameState {
  if (state.phase !== "playing" || state.propsRemaining.shuffle <= 0) return state;

  const active = state.board.filter((t) => !t.removed);
  const positions = active.map((t) => ({ x: t.x, y: t.y, layer: t.layer }));
  const types = active.map((t) => t.typeId);

  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j]!, types[i]!];
  }

  const board = cloneBoard(state.board);
  let idx = 0;
  for (const t of board) {
    if (t.removed) continue;
    t.typeId = types[idx]!;
    t.x = positions[idx]!.x;
    t.y = positions[idx]!.y;
    t.layer = positions[idx]!.layer;
    idx++;
  }

  return {
    ...state,
    board,
    propsRemaining: { ...state.propsRemaining, shuffle: state.propsRemaining.shuffle - 1 },
  };
}

export function usePropRemove(state: GameState): GameState {
  if (state.phase !== "playing" || state.propsRemaining.remove <= 0) return state;
  if (state.dock.length === 0) return state;

  const take = Math.min(3, state.dock.length);
  const dock = [...state.dock];
  const moved = dock.splice(0, take);
  const stash = [...state.stash, ...moved];

  let phase: GamePhase = state.phase;
  if (checkWin(state.board, dock, stash)) phase = "won";
  else if (checkLose(dock)) phase = "lost";

  return {
    ...state,
    dock,
    stash,
    propsRemaining: { ...state.propsRemaining, remove: state.propsRemaining.remove - 1 },
    phase,
  };
}

export function recordWin(save: YangSave, levelId: number): YangSave {
  const level = normalizeLevelId(levelId);
  if (level === 1) {
    return {
      ...save,
      bestLevel: Math.max(save.bestLevel, 1),
      currentLevel: 2,
      levelSeeds: {
        ...save.levelSeeds,
        2: save.levelSeeds[2] ?? defaultLevelSeed(2, save.dailySeed, save.totalClears),
      },
      lastSaved: Date.now(),
    };
  }
  const round = save.totalClears + 1;
  return {
    ...save,
    wins: save.wins + 1,
    totalClears: round,
    bestLevel: 2,
    currentLevel: 1,
    levelSeeds: {
      1: defaultLevelSeed(1, save.dailySeed, round),
      2: defaultLevelSeed(2, save.dailySeed, round),
    },
    lastSaved: Date.now(),
  };
}

export function recordLoss(save: YangSave): YangSave {
  return {
    ...save,
    losses: save.losses + 1,
    currentLevel: 1,
    lastSaved: Date.now(),
  };
}

export function ensureDailySeed(save: YangSave): YangSave {
  const daily = dailySeedString();
  if (save.dailySeed === daily) return save;
  return {
    ...save,
    dailySeed: daily,
    currentLevel: 1,
    levelSeeds: {
      1: defaultLevelSeed(1, daily, save.totalClears),
      2: defaultLevelSeed(2, daily, save.totalClears),
    },
  };
}

export function getTileEmoji(typeId: string): string {
  return TILE_TYPES.find((t) => t.id === typeId)?.emoji ?? "❓";
}

export function winRate(save: YangSave): number {
  const total = save.wins + save.losses;
  if (total === 0) return 0;
  return Math.round((save.wins / total) * 100);
}
