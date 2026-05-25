export type GamePhase = "playing" | "won" | "lost";

export interface BoardTile {
  uid: string;
  typeId: string;
  layer: number;
  /** 逻辑坐标（格） */
  x: number;
  y: number;
  removed: boolean;
}

export interface PropsRemaining {
  undo: number;
  shuffle: number;
  remove: number;
}

export interface GameSnapshot {
  board: BoardTile[];
  dock: string[];
  stash: string[];
  propsRemaining: PropsRemaining;
}

export interface GameState {
  board: BoardTile[];
  dock: string[];
  stash: string[];
  history: GameSnapshot[];
  phase: GamePhase;
  levelId: number;
  seed: string;
  propsRemaining: PropsRemaining;
}

export interface YangSave {
  version: number;
  playerId: string;
  playerName: string;
  accountId?: string;
  currentLevel: number;
  bestLevel: number;
  wins: number;
  losses: number;
  totalClears: number;
  dailySeed: string;
  levelSeeds: Record<number, string>;
  createdAt: number;
  lastSaved: number;
}

export interface YangLeaderboardEntry {
  playerId: string;
  playerName: string;
  bestLevel: number;
  totalWins: number;
  totalClears: number;
  winRate: number;
  updatedAt: number;
}

export type YangTab = "play" | "rank";

export const SAVE_VERSION = 1;
