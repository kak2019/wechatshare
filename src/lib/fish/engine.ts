import { BEASTS, CODEX_SETS, EQUIPMENT, FISH, SCENES } from "@/content/fish";
import { getEncounterById, rollEncounter } from "@/lib/fish/events";
import type {
  BeastInstance,
  CatchResult,
  EquipmentDef,
  EncounterDef,
  FishDef,
  GameSave,
  StatBonus,
  TowerBattleResult,
} from "@/lib/fish/types";

const SAVE_VERSION = 2;

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function playerId(): string {
  return `p-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function mergeBonus(a: StatBonus, b: StatBonus): StatBonus {
  return {
    atk: (a.atk ?? 0) + (b.atk ?? 0),
    def: (a.def ?? 0) + (b.def ?? 0),
    hp: (a.hp ?? 0) + (b.hp ?? 0),
  };
}

export function createNewSave(playerName = "无名渔夫"): GameSave {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    playerId: playerId(),
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
    treasures: {},
    dragonBalls: [],
    cards: {},
    permanentBonus: {},
    activeEncounter: null,
    streak: 0,
    createdAt: now,
    lastSaved: now,
  };
}

export function migrateSave(raw: Partial<GameSave>): GameSave {
  const base = createNewSave(raw.playerName ?? "无名渔夫");
  const merged = { ...base, ...raw, version: SAVE_VERSION };
  if (!merged.playerId) merged.playerId = playerId();
  if (!merged.treasures) merged.treasures = {};
  if (!merged.dragonBalls) merged.dragonBalls = [];
  if (!merged.cards) merged.cards = {};
  if (!merged.permanentBonus) merged.permanentBonus = {};
  if (!merged.activeEncounter) merged.activeEncounter = null;
  if (merged.streak === undefined) merged.streak = 0;
  merged.permanentBonus = recalcPermanentBonus(merged);
  return merged;
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

export function recalcPermanentBonus(save: Pick<GameSave, "codex" | "treasures" | "dragonBalls">): StatBonus {
  let bonus: StatBonus = {};

  for (const [id, count] of Object.entries(save.treasures)) {
    const fish = getFishById(id);
    if (!fish?.statBonus || count <= 0) continue;
    for (let i = 0; i < count; i++) {
      bonus = mergeBonus(bonus, fish.statBonus);
    }
  }

  for (const set of CODEX_SETS) {
    if (!set.statBonus) continue;
    const complete = set.fishIds.every((id) => (save.codex[id] ?? 0) > 0);
    if (complete) bonus = mergeBonus(bonus, set.statBonus);
  }

  return bonus;
}

function rarityMultiplier(rarity: FishDef["rarity"]): number {
  switch (rarity) {
    case "common": return 1;
    case "uncommon": return 0.6;
    case "rare": return 0.25;
    case "epic": return 0.1;
    case "legendary": return 0.04;
    case "mythical": return 0.015;
    case "equipment": return 0.12;
    case "treasure": return 0.06;
    case "card": return 0.05;
    default: return 1;
  }
}

function isFishAvailable(fish: FishDef, sceneId: string): boolean {
  if (fish.sceneIds && !fish.sceneIds.includes(sceneId)) return false;
  return true;
}

export interface RollContext {
  weatherBuff?: boolean;
}

export function rollCatch(save: GameSave, ctx: RollContext = {}): FishDef {
  const scene = getSceneById(save.currentScene);
  const codexBonus = getCodexBonus(save.codex);
  const rodBonus = (save.rodLevel - 1) * 0.04;
  const sceneBonus = scene?.rarityBonus ?? 0;
  const encounterBonus = save.activeEncounter
    ? (getEncounterById(save.activeEncounter.id)?.catchBonus ?? 0)
    : 0;
  const weatherBonus = ctx.weatherBuff ? 0.1 : 0;
  const totalBonus = rodBonus + sceneBonus + codexBonus + encounterBonus + weatherBonus;

  const pool = FISH.filter((f) => isFishAvailable(f, save.currentScene));

  const weights = pool.map((fish) => {
    let w = fish.baseWeight * rarityMultiplier(fish.rarity);
    if (fish.rarity !== "common" && fish.rarity !== "uncommon") {
      w *= 1 + totalBonus;
    }
    if (fish.category === "beast") w *= 1 + rodBonus * 2 + codexBonus;
    if (fish.category === "treasure" || fish.category === "card") {
      w *= 1 + totalBonus * 1.5;
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

function applyTreasure(next: GameSave, fish: FishDef): string {
  next.treasures[fish.id] = (next.treasures[fish.id] ?? 0) + 1;
  if (fish.id.startsWith("db_")) {
    const star = parseInt(fish.id.replace("db_", ""), 10);
    if (!next.dragonBalls.includes(star)) {
      next.dragonBalls = [...next.dragonBalls, star].sort((a, b) => a - b);
    }
  }
  next.permanentBonus = recalcPermanentBonus(next);
  const bonus = fish.statBonus;
  const bonusText = bonus
    ? `（灵兽永久 +${bonus.atk ?? 0}攻 +${bonus.def ?? 0}防 +${bonus.hp ?? 0}血）`
    : "";
  if (next.dragonBalls.length === 7) {
    return `🐉 凑齐七龙珠！！神龙祝福降临！${bonusText}`;
  }
  return `💎 获得宝物 ${fish.name}！${bonusText}`;
}

function applyCard(next: GameSave, fish: FishDef): string {
  next.cards[fish.id] = (next.cards[fish.id] ?? 0) + 1;
  return `🃏 获得卡片「${fish.name}」！去背包使用。`;
}

export function maybeTriggerEncounter(save: GameSave, force = false): EncounterDef | null {
  const chance = force ? 1 : 0.08 + (save.streak >= 5 ? 0.05 : 0);
  return rollEncounter(chance);
}

export function applyEncounter(save: GameSave, encounter: EncounterDef): GameSave {
  const next = { ...save, activeEncounter: { id: encounter.id, remaining: encounter.duration ?? 3 } };
  if (encounter.id === "couple_blessing") {
    next.permanentBonus = mergeBonus(next.permanentBonus, { atk: 2, def: 2, hp: 5 });
  }
  return next;
}

export function tickEncounter(save: GameSave): GameSave {
  if (!save.activeEncounter) return save;
  const remaining = save.activeEncounter.remaining - 1;
  if (remaining <= 0) return { ...save, activeEncounter: null };
  return { ...save, activeEncounter: { ...save.activeEncounter, remaining } };
}

export function processCatch(save: GameSave, fish: FishDef, encounter?: EncounterDef): { save: GameSave; result: CatchResult } {
  let next: GameSave = {
    ...save,
    codex: { ...save.codex },
    beasts: save.beasts.map((b) => ({ ...b, equipment: { ...b.equipment } })),
    inventory: [...save.inventory],
    treasures: { ...save.treasures },
    cards: { ...save.cards },
    dragonBalls: [...save.dragonBalls],
  };
  next.totalCatches += 1;
  next.streak += 1;
  next.codex[fish.id] = (next.codex[fish.id] ?? 0) + 1;
  next = tickEncounter(next);

  const isNew = next.codex[fish.id] === 1;
  let leveledBeast: BeastInstance | undefined;
  let autoEquipped: EquipmentDef | undefined;
  let message = "";

  if (fish.category === "equipment") {
    const target = next.beasts.find((b) => b.uid === next.selectedBeastId) ?? next.beasts[0];
    if (target) {
      autoEquipped = tryAutoEquip(target, fish.id);
      message = autoEquipped
        ? `${getFishById(target.beastId)?.name ?? "灵兽"} 自动装备了 ${autoEquipped.name}！`
        : `获得 ${fish.name}，当前装备更好。`;
    } else {
      next.inventory.push({ uid: uid(), fishId: fish.id, caughtAt: Date.now() });
      message = `获得 ${fish.name}，暂无灵兽，已放入背包。`;
    }
  } else if (fish.category === "treasure") {
    message = applyTreasure(next, fish);
  } else if (fish.category === "card") {
    message = applyCard(next, fish);
  } else if (fish.category === "encounter") {
    next.gold += fish.value;
    message = `🎭 奇遇！${fish.ascii} ${fish.name} — ${fish.description ?? ""}${fish.value ? ` (+${fish.value}金)` : ""}`;
  } else if (isRaiseable(fish.id)) {
    const existing = next.beasts.find((b) => b.beastId === fish.id);
    const expGain = 30 + (fish.rarity === "mythical" ? 50 : 20) + (encounter?.id === "moon_eclipse" ? 30 : 0);
    if (existing) {
      existing.exp += expGain;
      while (existing.exp >= expForLevel(existing.level)) {
        existing.exp -= expForLevel(existing.level);
        existing.level += 1;
      }
      leveledBeast = existing;
      message = `又钓到 ${fish.name}！灵兽经验 +${expGain}，当前 Lv.${existing.level}`;
    } else {
      const beast: BeastInstance = { uid: uid(), beastId: fish.id, level: 1, exp: 0, equipment: {} };
      next.beasts.push(beast);
      if (!next.selectedBeastId) next.selectedBeastId = beast.uid;
      message = `🌟 首次捕获 ${fish.name}！已加入灵兽栏！`;
    }
  } else {
    next.inventory.push({ uid: uid(), fishId: fish.id, caughtAt: Date.now() });
    const tag =
      fish.rarity === "mythical" ? "🌟 天降神兽！" :
      fish.rarity === "legendary" ? "✨ 传奇现身！" :
      fish.rarity === "epic" ? "💜 史诗！" : "入篓！";
    message = `${tag} ${fish.ascii} ${fish.name}（${fish.value} 金）`;
  }

  if (encounter) message = `${encounter.ascii} ${encounter.message} ${message}`;

  return { save: next, result: { fish, isNew, leveledBeast, autoEquipped, encounter, message } };
}

export function useCard(save: GameSave, cardId: string): { save: GameSave; effect: string } | null {
  const count = save.cards[cardId] ?? 0;
  if (count <= 0) return null;
  const fish = getFishById(cardId);
  if (!fish) return null;

  const next = { ...save, cards: { ...save.cards } };
  next.cards[cardId] = count - 1;

  switch (fish.cardEffect) {
    case "lucky":
      return { save: applyEncounter(next, { id: "lucky_breeze", name: "幸运星", ascii: "⭐", message: "幸运星生效！", catchBonus: 0.3, duration: 1 }), effect: "下次抛竿触发奇遇！" };
    case "double":
      next.activeEncounter = { id: "double_gold", remaining: 1 };
      return { save: next, effect: "下次钓鱼金币翻倍！" };
    case "blessing": {
      const beast = next.beasts.find((b) => b.uid === next.selectedBeastId) ?? next.beasts[0];
      if (beast) {
        beast.exp += 100;
        while (beast.exp >= expForLevel(beast.level)) {
          beast.exp -= expForLevel(beast.level);
          beast.level += 1;
        }
      }
      return { save: next, effect: "一二 & 布布祝福！灵兽获得大量经验！" };
    }
    case "weather":
      return { save: next, effect: "weather_broadcast" };
    default:
      return { save: next, effect: "使用了卡片。" };
  }
}

export function sellFish(save: GameSave, uidToSell: string): GameSave {
  const item = save.inventory.find((i) => i.uid === uidToSell);
  if (!item) return save;
  const fish = getFishById(item.fishId);
  if (!fish || fish.category === "card") return save;
  return { ...save, gold: save.gold + fish.value, inventory: save.inventory.filter((i) => i.uid !== uidToSell), totalSold: save.totalSold + 1 };
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

export function getBeastStats(beast: BeastInstance, permanentBonus: StatBonus = {}) {
  const beastDef = BEASTS.find((b) => b.id === beast.beastId) ?? {
    baseAtk: 80, baseDef: 60, baseHp: 300, name: beast.beastId, element: "?",
  };
  let atk = beastDef.baseAtk + (beast.level - 1) * 15 + (permanentBonus.atk ?? 0);
  let defense = beastDef.baseDef + (beast.level - 1) * 10 + (permanentBonus.def ?? 0);
  let hp = beastDef.baseHp + (beast.level - 1) * 40 + (permanentBonus.hp ?? 0);

  for (const slot of ["head", "body", "weapon", "accessory"] as const) {
    const eq = beast.equipment[slot] ? getEquipmentById(beast.equipment[slot]!) : undefined;
    if (eq) { atk += eq.atk; defense += eq.def; hp += eq.hp; }
  }
  return { atk, def: defense, hp, name: beastDef.name, element: beastDef.element };
}

function getLegendaryStats(beast: BeastInstance, permanentBonus: StatBonus = {}) {
  const fish = getFishById(beast.beastId);
  const base = fish?.rarity === "legendary" ? 70 : 50;
  let atk = base + (beast.level - 1) * 12 + (permanentBonus.atk ?? 0);
  let def = base * 0.7 + (beast.level - 1) * 8 + (permanentBonus.def ?? 0);
  let hp = base * 4 + (beast.level - 1) * 35 + (permanentBonus.hp ?? 0);
  for (const slot of ["head", "body", "weapon", "accessory"] as const) {
    const eq = beast.equipment[slot] ? getEquipmentById(beast.equipment[slot]!) : undefined;
    if (eq) { atk += eq.atk; def += eq.def; hp += eq.hp; }
  }
  return { atk: Math.round(atk), def: Math.round(def), hp: Math.round(hp) };
}

export function getUnitStats(beast: BeastInstance, permanentBonus: StatBonus = {}) {
  if (isBeastFish(beast.beastId)) return getBeastStats(beast, permanentBonus);
  return getLegendaryStats(beast, permanentBonus);
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
  const stats = getUnitStats(beast, save.permanentBonus);

  let beastHp = stats.hp;
  let enemyHp = enemy.hp;
  const log: string[] = [`⚔️ ${getFishById(beast.beastId)?.name ?? beast.beastId} Lv.${beast.level} 挑战 ${enemy.name}`];

  for (let turn = 0; turn < 30 && beastHp > 0 && enemyHp > 0; turn++) {
    const dmg = Math.max(1, stats.atk - enemy.def * 0.3);
    enemyHp -= dmg;
    log.push(`  造成 ${Math.round(dmg)} 伤害`);
    if (enemyHp <= 0) break;
    const edmg = Math.max(1, enemy.atk - stats.def * 0.3);
    beastHp -= edmg;
    log.push(`  受到 ${Math.round(edmg)} 伤害`);
  }

  const won = enemyHp <= 0;
  let goldReward = won ? Math.round(50 + floor * 20 * (isBoss ? 3 : 1)) : 0;
  if (won && save.activeEncounter?.id === "meteor_shower") goldReward = Math.round(goldReward * 1.5);

  if (won) {
    log.push(`🎉 通关第 ${floor} 层！+${goldReward} 金`);
    if (isBoss) log.push("💥 BOSS 击破！");
  } else {
    log.push("😵 灵兽力竭，休整后再来！");
  }

  return {
    save: { ...save, towerFloor: won ? floor : save.towerFloor, gold: save.gold + goldReward },
    result: { won, floor, isBoss, goldReward, log, beastHpLeft: Math.max(0, Math.round(beastHp)) },
  };
}

export function getCatchRateDisplay(save: GameSave, weatherActive = false): string {
  const codexBonus = getCodexBonus(save.codex);
  const rodBonus = (save.rodLevel - 1) * 4;
  const scene = getSceneById(save.currentScene);
  const parts = [
    `鱼竿 Lv.${save.rodLevel}（+${rodBonus}%）`,
    `场景 +${Math.round((scene?.rarityBonus ?? 0) * 100)}%`,
    `图鉴 +${Math.round(codexBonus * 100)}%`,
    `连钓 ${save.streak} 次`,
  ];
  if (save.activeEncounter) parts.push(`奇遇 ${save.activeEncounter.remaining} 剩`);
  if (weatherActive) parts.push("☀️全服天气+10%");
  const pb = save.permanentBonus;
  if ((pb.atk ?? 0) + (pb.def ?? 0) + (pb.hp ?? 0) > 0) {
    parts.push(`灵兽加成 +${pb.atk ?? 0}/${pb.def ?? 0}/${pb.hp ?? 0}`);
  }
  return parts.join("｜");
}

export function shouldBroadcastCatch(fish: FishDef): boolean {
  return fish.rarity === "mythical" || fish.rarity === "legendary" || fish.category === "treasure" || fish.id.startsWith("db_") || fish.id === "yi_er" || fish.id === "bu_bu";
}

export function exportSave(save: GameSave): string {
  return JSON.stringify(save, null, 2);
}

export function importSave(json: string): GameSave | null {
  try {
    return migrateSave(JSON.parse(json) as Partial<GameSave>);
  } catch {
    return null;
  }
}
