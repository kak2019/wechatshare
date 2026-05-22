export type FishRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythical" | "equipment";

export type FishCategory = "fish" | "beast" | "legendary" | "equipment";

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
  createdAt: number;
  lastSaved: number;
}

export interface CatchResult {
  fish: FishDef;
  isNew: boolean;
  leveledBeast?: BeastInstance;
  autoEquipped?: EquipmentDef;
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

export type GameTab = "fish" | "codex" | "shop" | "bag" | "tower";
