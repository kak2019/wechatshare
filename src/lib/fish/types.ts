export type FishRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythical"
  | "equipment"
  | "treasure"
  | "card";

export type FishCategory =
  | "fish"
  | "beast"
  | "legendary"
  | "equipment"
  | "treasure"
  | "card"
  | "encounter";

export interface StatBonus {
  atk?: number;
  def?: number;
  hp?: number;
}

export interface FishDef {
  id: string;
  name: string;
  ascii: string;
  rarity: FishRarity;
  category: FishCategory;
  value: number;
  setId?: string;
  sceneIds?: string[];
  baseWeight: number;
  canRaise?: boolean;
  description?: string;
  statBonus?: StatBonus;
  /** 卡片效果 id */
  cardEffect?: string;
}

export interface EquipmentDef {
  id: string;
  name: string;
  slot: "head" | "body" | "weapon" | "accessory";
  atk: number;
  def: number;
  hp: number;
  rarity: FishRarity;
  ascii: string;
}

export interface SceneDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockRodLevel: number;
  bgClass: string;
  waterArt: string;
  rarityBonus: number;
}

export interface CodexSetDef {
  id: string;
  name: string;
  fishIds: string[];
  bonusLabel: string;
  rareBonus: number;
  statBonus?: StatBonus;
}

export interface EncounterDef {
  id: string;
  name: string;
  ascii: string;
  message: string;
  /** 接下来 N 次抛竿的稀有度加成 */
  catchBonus?: number;
  duration?: number;
  goldBonus?: number;
}

export interface BeastDef {
  id: string;
  name: string;
  ascii: string;
  element: string;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
}

export interface FishInstance {
  uid: string;
  fishId: string;
  caughtAt: number;
}

export interface BeastInstance {
  uid: string;
  beastId: string;
  level: number;
  exp: number;
  equipment: Partial<Record<"head" | "body" | "weapon" | "accessory", string>>;
}

export interface GameSave {
  version: number;
  accountId?: string;
  playerId: string;
  playerName: string;
  gold: number;
  rodLevel: number;
  currentScene: string;
  inventory: FishInstance[];
  codex: Record<string, number>;
  beasts: BeastInstance[];
  selectedBeastId: string | null;
  towerFloor: number;
  totalCatches: number;
  totalSold: number;
  treasures: Record<string, number>;
  dragonBalls: number[];
  cards: Record<string, number>;
  permanentBonus: StatBonus;
  activeEncounter: { id: string; remaining: number } | null;
  streak: number;
  createdAt: number;
  lastSaved: number;
}

export interface CatchResult {
  fish: FishDef;
  isNew: boolean;
  leveledBeast?: BeastInstance;
  autoEquipped?: EquipmentDef;
  encounter?: EncounterDef;
  message: string;
}

export interface TowerBattleResult {
  won: boolean;
  floor: number;
  isBoss: boolean;
  goldReward: number;
  log: string[];
  beastHpLeft: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalGold: number;
  towerFloor: number;
  totalCatches: number;
  mythicalCount: number;
  rodLevel: number;
  updatedAt: number;
}

export interface GlobalEvent {
  id: string;
  type: "catch" | "weather" | "encounter" | "dragon";
  playerName: string;
  message: string;
  createdAt: number;
  expiresAt?: number;
}

export interface GlobalState {
  events: GlobalEvent[];
  weatherBuffUntil: number;
  weatherBuffBy: string;
}

export type GameTab = "fish" | "codex" | "shop" | "bag" | "tower" | "rank";
