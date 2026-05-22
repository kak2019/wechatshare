import { BEASTS, CODEX_SETS, EQUIPMENT, FISH, SCENES } from "@/content/fish";
import type {
  BeastInstance,
  CatchResult,
  EquipmentDef,
  FishDef,
  GameSave,
  TowerBattleResult,
} from "@/lib/fish/types";

const SAVE_VERSION = 1;

export function createNewSave(playerName = "无名渔夫"): GameSave {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    playerName,
    gold: 100,
    rodLevel: 1,
    currentScene: "dawn_lake",
    inventory: [],
    codex: {},
    beasts: [],
    selectedBeastId: null,
    towerFloor: 0,
    totalCatches: 0,
    totalSold: 0,
    createdAt: now,
    lastSaved: now,
  };
}

export function getFishById(id: string): FishDef | undefined {
  return FISH.find((f) => f.id === id);
}

export function getEquipmentById(id: string): EquipmentDef | undefined {
  return EQUIPMENT.find((e) => e.id === id);
}

export function getSceneById(id: string) {
  return SCENES.find((s) => s.id === id);
}

export function rodUpgradeCost(level: number): number {
  return level * 500 + level * level * 100;
}

export function getCodexBonus(codex: Record<string, number>): number {
  let bonus = 0;
  for (const set of CODEX_SETS) {
    const complete = set.fishIds.every((id) => (codex[id] ?? 0) > 0);
    if (complete) bonus += set.rareBonus;
  }
  return bonus;
}

export function getCompletedSets(codex: Record<string, number>) {
  return CODEX_SETS.filter((set) => set.fishIds.every((id) => (codex[id] ?? 0) > 0));
}

function rarityMultiplier(rarity: FishDef["rarity"]): number {
  switch (rarity) {
    case "common":
      return 1;
    case "uncommon":
      return 0.6;
    case "rare":
      return 0.25;
    case "epic":
      return 0.1;
    case "legendary":
      return 0.04;
    case "mythical":
      return 0.015;
    case "equipment":
      return 0.12;
    default:
      return 1;
  }
}

function isFishAvailable(fish: FishDef, sceneId: string): boolean {
  if (fish.sceneIds && !fish.sceneIds.includes(sceneId)) return false;
  return true;
}

export function rollCatch(save: GameSave): FishDef {
  const scene = getSceneById(save.currentScene);
  const codexBonus = getCodexBonus(save.codex);
  const rodBonus = (save.rodLevel - 1) * 0.04;
  const sceneBonus = scene?.rarityBonus ?? 0;

  const pool = FISH.filter((f) => isFishAvailable(f, save.currentScene));

  const weights = pool.map((fish) => {
    let w = fish.baseWeight * rarityMultiplier(fish.rarity);
    if (fish.rarity !== "common" && fish.rarity !== "uncommon") {
      w *= 1 + rodBonus + sceneBonus + codexBonus;
    }
    if (fish.category === "beast") {
      w *= 1 + rodBonus * 2 + codexBonus * 1.5;
    }
    return Math.max(w, 0.001);
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function expForLevel(level: number): number {
  return level * 50 + (level - 1) * (level - 1) * 20;
}

function isBeastFish(fishId: string): boolean {
  return BEASTS.some((b) => b.id === fishId);
}

function isRaiseable(fishId: string): boolean {
  const fish = getFishById(fishId);
  return !!(fish?.canRaise || isBeastFish(fishId));
}

function equipScore(eq: EquipmentDef): number {
  return eq.atk + eq.def + eq.hp * 0.5;
}

function tryAutoEquip(beast: BeastInstance, equipId: string): EquipmentDef | undefined {
  const eq = getEquipmentById(equipId);
  if (!eq) return undefined;

  const currentId = beast.equipment[eq.slot];
  const current = currentId ? getEquipmentById(currentId) : undefined;
  if (current && equipScore(current) >= equipScore(eq)) return undefined;

  beast.equipment[eq.slot] = equipId;
  return eq;
}

export function processCatch(save: GameSave, fish: FishDef): { save: GameSave; result: CatchResult } {
  const next = { ...save, codex: { ...save.codex }, beasts: [...save.beasts], inventory: [...save.inventory] };
  next.totalCatches += 1;
  next.codex[fish.id] = (next.codex[fish.id] ?? 0) + 1;

  const isNew = next.codex[fish.id] === 1;
  let leveledBeast: BeastInstance | undefined;
  let autoEquipped: EquipmentDef | undefined;
  let message = "";

  if (fish.category === "equipment") {
    const targetBeast = next.beasts.find((b) => b.uid === next.selectedBeastId) ?? next.beasts[0];
    if (targetBeast) {
      autoEquipped = tryAutoEquip(targetBeast, fish.id);
      message = autoEquipped
        ? `${targetBeast.beastId} 自动装备了 ${autoEquipped.name}！`
        : `获得了 ${fish.name}，但当前装备更好。`;
    } else {
      next.inventory.push({ uid: uid(), fishId: fish.id, caughtAt: Date.now() });
      message = `获得了 ${fish.name}，暂无灵兽可穿戴，已放入背包。`;
    }
  } else if (isRaiseable(fish.id)) {
    const existing = next.beasts.find((b) => b.beastId === fish.id);
    if (existing) {
      existing.exp += 30 + fish.rarity === "mythical" ? 50 : 20;
      while (existing.exp >= expForLevel(existing.level)) {
        existing.exp -= expForLevel(existing.level);
        existing.level += 1;
      }
      leveledBeast = existing;
      message = `又钓到了 ${fish.name}！灵兽经验增加，当前 Lv.${existing.level}`;
    } else {
      const beast: BeastInstance = {
        uid: uid(),
        beastId: fish.id,
        level: 1,
        exp: 0,
        equipment: {},
      };
      next.beasts.push(beast);
      if (!next.selectedBeastId) next.selectedBeastId = beast.uid;
      message = `首次捕获 ${fish.name}！已加入灵兽栏，可以养成与闯塔！`;
    }
  } else {
    next.inventory.push({ uid: uid(), fishId: fish.id, caughtAt: Date.now() });
    const rarityText =
      fish.rarity === "mythical"
        ? "🌟 天降神兽！"
        : fish.rarity === "legendary"
          ? "✨ 传奇现身！"
          : fish.rarity === "epic"
            ? "💜 史诗级收获！"
            : "入篓成功！";
    message = `${rarityText} ${fish.ascii} ${fish.name}（${fish.value} 金）`;
  }

  return {
    save: next,
    result: { fish, isNew, leveledBeast, autoEquipped, message },
  };
}

export function sellFish(save: GameSave, uidToSell: string): GameSave {
  const item = save.inventory.find((i) => i.uid === uidToSell);
  if (!item) return save;
  const fish = getFishById(item.fishId);
  if (!fish) return save;

  return {
    ...save,
    gold: save.gold + fish.value,
    inventory: save.inventory.filter((i) => i.uid !== uidToSell),
    totalSold: save.totalSold + 1,
  };
}

export function sellAllCommon(save: GameSave): GameSave {
  let gold = save.gold;
  const keep = save.inventory.filter((item) => {
    const fish = getFishById(item.fishId);
    if (!fish) return true;
    if (fish.rarity === "common" || fish.rarity === "uncommon") {
      gold += fish.value;
      return false;
    }
    return true;
  });
  return { ...save, gold, inventory: keep };
}

export function upgradeRod(save: GameSave): GameSave | null {
  const cost = rodUpgradeCost(save.rodLevel);
  if (save.gold < cost) return null;
  return { ...save, gold: save.gold - cost, rodLevel: save.rodLevel + 1 };
}

export function getBeastStats(beast: BeastInstance) {
  const beastDef = BEASTS.find((b) => b.id === beast.beastId) ?? {
    baseAtk: 80,
    baseDef: 60,
    baseHp: 300,
    name: beast.beastId,
    element: "?",
  };

  let atk = beastDef.baseAtk + (beast.level - 1) * 15;
  let defense = beastDef.baseDef + (beast.level - 1) * 10;
  let hp = beastDef.baseHp + (beast.level - 1) * 40;

  for (const slot of ["head", "body", "weapon", "accessory"] as const) {
    const eqId = beast.equipment[slot];
    if (!eqId) continue;
    const eq = getEquipmentById(eqId);
    if (eq) {
      atk += eq.atk;
      defense += eq.def;
      hp += eq.hp;
    }
  }

  return {
    atk,
    def: defense,
    hp,
    name: beastDef.name ?? beast.beastId,
    element: beastDef.element ?? "?",
  };
}

function getLegendaryStats(beast: BeastInstance) {
  const fish = getFishById(beast.beastId);
  const base = fish?.rarity === "legendary" ? 70 : 50;
  let atk = base + (beast.level - 1) * 12;
  let def = base * 0.7 + (beast.level - 1) * 8;
  let hp = base * 4 + (beast.level - 1) * 35;

  for (const slot of ["head", "body", "weapon", "accessory"] as const) {
    const eqId = beast.equipment[slot];
    if (!eqId) continue;
    const eq = getEquipmentById(eqId);
    if (eq) {
      atk += eq.atk;
      def += eq.def;
      hp += eq.hp;
    }
  }

  return { atk: Math.round(atk), def: Math.round(def), hp: Math.round(hp) };
}

export function getUnitStats(beast: BeastInstance) {
  if (isBeastFish(beast.beastId)) return getBeastStats(beast);
  return getLegendaryStats(beast);
}

function floorEnemyStats(floor: number, isBoss: boolean) {
  const mult = isBoss ? 2.5 : 1;
  return {
    atk: Math.round((8 + floor * 4) * mult),
    def: Math.round((5 + floor * 2.5) * mult),
    hp: Math.round((40 + floor * 25) * mult),
    name: isBoss ? `第${floor}层·守关妖将` : `第${floor}层·水妖`,
  };
}

export function runTowerBattle(save: GameSave, beastUid: string): { save: GameSave; result: TowerBattleResult } | null {
  const beast = save.beasts.find((b) => b.uid === beastUid);
  if (!beast || beast.level < 3) return null;

  const floor = save.towerFloor + 1;
  const isBoss = floor % 10 === 0;
  const enemy = floorEnemyStats(floor, isBoss);
  const stats = getUnitStats(beast);

  let beastHp = stats.hp;
  let enemyHp = enemy.hp;
  const log: string[] = [];
  log.push(`⚔️ ${beast.beastId} Lv.${beast.level} 挑战 ${enemy.name}`);

  let turn = 0;
  while (beastHp > 0 && enemyHp > 0 && turn < 30) {
    turn++;
    const dmg = Math.max(1, stats.atk - enemy.def * 0.3);
    enemyHp -= dmg;
    log.push(`  你造成 ${Math.round(dmg)} 伤害`);

    if (enemyHp <= 0) break;

    const edmg = Math.max(1, enemy.atk - stats.def * 0.3);
    beastHp -= edmg;
    log.push(`  敌人反击 ${Math.round(edmg)} 伤害`);
  }

  const won = enemyHp <= 0;
  const goldReward = won ? Math.round(50 + floor * 20 * (isBoss ? 3 : 1)) : 0;

  if (won) {
    log.push(`🎉 通关第 ${floor} 层！获得 ${goldReward} 金`);
    if (isBoss) log.push("💥 BOSS 击破！灵兽威名远扬！");
  } else {
    log.push("😵 灵兽力竭，下次再来！");
  }

  return {
    save: {
      ...save,
      towerFloor: won ? floor : save.towerFloor,
      gold: save.gold + goldReward,
    },
    result: {
      won,
      floor,
      isBoss,
      goldReward,
      log,
      beastHpLeft: Math.max(0, Math.round(beastHp)),
    },
  };
}

export function getCatchRateDisplay(save: GameSave): string {
  const codexBonus = getCodexBonus(save.codex);
  const rodBonus = (save.rodLevel - 1) * 4;
  const scene = getSceneById(save.currentScene);
  const sceneBonus = Math.round((scene?.rarityBonus ?? 0) * 100);
  const setCount = getCompletedSets(save.codex).length;
  return `鱼竿 Lv.${save.rodLevel}（+${rodBonus}%）｜场景 +${sceneBonus}%｜图鉴套装 ${setCount} 套（+${Math.round(codexBonus * 100)}%）`;
}

export function exportSave(save: GameSave): string {
  return JSON.stringify(save, null, 2);
}

export function importSave(json: string): GameSave | null {
  try {
    const parsed = JSON.parse(json) as GameSave;
    if (typeof parsed.gold !== "number" || typeof parsed.rodLevel !== "number") return null;
    return { ...createNewSave(), ...parsed, version: SAVE_VERSION, lastSaved: Date.now() };
  } catch {
    return null;
  }
}
