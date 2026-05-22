import type { EncounterDef } from "@/lib/fish/types";

/** 抛竿时随机触发的奇遇事件 */
export const ENCOUNTERS: EncounterDef[] = [
  {
    id: "golden_tide",
    name: "金色鱼汛",
    ascii: "🌊✨",
    message: "水面泛起金色涟漪！接下来几次更容易钓到稀有鱼！",
    catchBonus: 0.25,
    duration: 5,
  },
  {
    id: "time_rift",
    name: "时空裂缝",
    ascii: "🌀",
    message: "时空裂缝撕开！跨界传说正在靠近…",
    catchBonus: 0.35,
    duration: 3,
  },
  {
    id: "moon_eclipse",
    name: "月全食",
    ascii: "🌑",
    message: "月全食降临，灵兽经验双倍（下次同类升级）！",
    catchBonus: 0.15,
    duration: 4,
  },
  {
    id: "rainbow_bridge",
    name: "彩虹桥",
    ascii: "🌈",
    message: "彩虹桥横跨江面，宝石与龙珠浮现！",
    catchBonus: 0.4,
    duration: 3,
  },
  {
    id: "couple_blessing",
    name: "双人祝福",
    ascii: "💕",
    message: "一二与布布的祝福降临！全属性微量提升！",
    catchBonus: 0.2,
    duration: 5,
  },
  {
    id: "meteor_shower",
    name: "流星雨",
    ascii: "☄️",
    message: "流星雨划过！通天塔奖励加成！",
    goldBonus: 0.5,
    duration: 3,
  },
  {
    id: "ancient_echo",
    name: "远古回响",
    ascii: "📯",
    message: "远古号角吹响，神兽躁动不安…",
    catchBonus: 0.5,
    duration: 2,
  },
  {
    id: "lucky_breeze",
    name: "幸运微风",
    ascii: "🍃",
    message: "一阵幸运微风拂过鱼线！",
    catchBonus: 0.12,
    duration: 6,
  },
];

export function rollEncounter(baseChance = 0.08): EncounterDef | null {
  if (Math.random() > baseChance) return null;
  return ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];
}

export function getEncounterById(id: string): EncounterDef | undefined {
  return ENCOUNTERS.find((e) => e.id === id);
}
