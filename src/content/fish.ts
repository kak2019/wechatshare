import type { BeastDef, CodexSetDef, EquipmentDef, FishDef, SceneDef } from "@/lib/fish/types";

/** 场景 */
export const SCENES: SceneDef[] = [
  {
    id: "dawn_lake",
    name: "晨曦湖",
    emoji: "🌅",
    description: "晨光洒在湖面，普通鱼儿在此嬉戏。",
    unlockRodLevel: 1,
    bgClass: "from-sky-200 via-blue-100 to-emerald-100",
    waterArt: "～～～～～～～～～～～～～～",
    rarityBonus: 0,
  },
  {
    id: "mist_river",
    name: "迷雾江",
    emoji: "🌫️",
    description: "江雾缭绕，偶有珍奇出没。",
    unlockRodLevel: 2,
    bgClass: "from-slate-300 via-gray-200 to-teal-100",
    waterArt: "≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈",
    rarityBonus: 0.05,
  },
  {
    id: "bamboo_pond",
    name: "竹韵塘",
    emoji: "🎋",
    description: "翠竹环绕，江湖水族聚集之地。",
    unlockRodLevel: 3,
    bgClass: "from-green-200 via-lime-100 to-amber-50",
    waterArt: "～～～～～～～～～～～～～～",
    rarityBonus: 0.08,
  },
  {
    id: "starry_sea",
    name: "星空海",
    emoji: "✨",
    description: "星光坠入深海，传说在此苏醒。",
    unlockRodLevel: 5,
    bgClass: "from-indigo-900 via-purple-800 to-blue-900",
    waterArt: "✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦",
    rarityBonus: 0.15,
  },
  {
    id: "volcano_spring",
    name: "火山温泉",
    emoji: "🌋",
    description: "地火涌动，奇兽与异宝共存。",
    unlockRodLevel: 7,
    bgClass: "from-orange-400 via-red-300 to-yellow-200",
    waterArt: "≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋",
    rarityBonus: 0.2,
  },
  {
    id: "cloud_palace",
    name: "云顶仙池",
    emoji: "☁️",
    description: "九天之上，神兽与传奇鱼栖息之所。",
    unlockRodLevel: 10,
    bgClass: "from-violet-200 via-fuchsia-100 to-amber-100",
    waterArt: "☁️～～～☁️～～～☁️～～～☁️",
    rarityBonus: 0.3,
  },
];

/** 图鉴套装 — 集齐增加珍稀概率 */
export const CODEX_SETS: CodexSetDef[] = [
  {
    id: "jianghu",
    name: "江湖水族",
    fishIds: ["carp", "grass_carp", "crucian", "silver_carp", "bighead"],
    bonusLabel: "稀有鱼 +8%",
    rareBonus: 0.08,
  },
  {
    id: "deep_sea",
    name: "深海奇珍",
    fishIds: ["snapper", "lanternfish", "oarfish", "goblin_shark", "vampire_squid"],
    bonusLabel: "史诗鱼 +10%",
    rareBonus: 0.1,
  },
  {
    id: "legend_pool",
    name: "传说异兽",
    fishIds: ["golden_dragon_fish", "flying_fish", "swordfish", "electric_eel", "sperm_whale"],
    bonusLabel: "传奇鱼 +12%",
    rareBonus: 0.12,
  },
  {
    id: "four_beasts",
    name: "四象神兽",
    fishIds: ["qinglong", "baihu", "zhuque", "xuanwu"],
    bonusLabel: "神兽 +15%",
    rareBonus: 0.15,
  },
  {
    id: "crossover",
    name: "跨界传说",
    fishIds: ["tiga", "pikachu", "nezha", "wukong"],
    bonusLabel: "特殊传奇 +10%",
    rareBonus: 0.1,
  },
];

/** 四神兽 */
export const BEASTS: BeastDef[] = [
  { id: "qinglong", name: "青龙", ascii: "🐉", element: "木", baseAtk: 120, baseDef: 80, baseHp: 500 },
  { id: "baihu", name: "白虎", ascii: "🐯", element: "金", baseAtk: 150, baseDef: 60, baseHp: 450 },
  { id: "zhuque", name: "朱雀", ascii: "🔥", element: "火", baseAtk: 140, baseDef: 50, baseHp: 400 },
  { id: "xuanwu", name: "玄武", ascii: "🐢", element: "水", baseAtk: 90, baseDef: 150, baseHp: 600 },
];

/** 装备 */
export const EQUIPMENT: EquipmentDef[] = [
  { id: "scale_helm", name: "鱼鳞盔", slot: "head", atk: 5, def: 15, hp: 30, rarity: "uncommon", ascii: "⛑️" },
  { id: "coral_armor", name: "珊瑚甲", slot: "body", atk: 0, def: 25, hp: 50, rarity: "rare", ascii: "🛡️" },
  { id: "pearl_sword", name: "珍珠剑", slot: "weapon", atk: 30, def: 0, hp: 0, rarity: "rare", ascii: "⚔️" },
  { id: "jade_ring", name: "玉佩", slot: "accessory", atk: 10, def: 10, hp: 20, rarity: "uncommon", ascii: "💍" },
  { id: "dragon_crown", name: "龙须冠", slot: "head", atk: 20, def: 30, hp: 60, rarity: "epic", ascii: "👑" },
  { id: "phoenix_robe", name: "凤羽袍", slot: "body", atk: 15, def: 40, hp: 80, rarity: "epic", ascii: "🥋" },
  { id: "thunder_trident", name: "雷霆三叉戟", slot: "weapon", atk: 60, def: 10, hp: 0, rarity: "epic", ascii: "🔱" },
  { id: "star_pendant", name: "星辰吊坠", slot: "accessory", atk: 25, def: 25, hp: 50, rarity: "epic", ascii: "📿" },
  { id: "heaven_crown", name: "通天冠", slot: "head", atk: 40, def: 50, hp: 100, rarity: "legendary", ascii: "✨" },
  { id: "myth_armor", name: "神兽鳞甲", slot: "body", atk: 30, def: 70, hp: 150, rarity: "legendary", ascii: "🐲" },
  { id: "god_sword", name: "斩妖剑", slot: "weapon", atk: 100, def: 20, hp: 0, rarity: "legendary", ascii: "🗡️" },
  { id: "immortal_jade", name: "仙灵玉", slot: "accessory", atk: 50, def: 50, hp: 100, rarity: "legendary", ascii: "💎" },
];

/** 所有可钓物品 */
export const FISH: FishDef[] = [
  // 普通
  { id: "minnow", name: "小银鱼", ascii: "🐟", rarity: "common", category: "fish", value: 5, baseWeight: 100, setId: undefined },
  { id: "carp", name: "鲤鱼", ascii: "🐠", rarity: "common", category: "fish", value: 12, baseWeight: 80, setId: "jianghu" },
  { id: "grass_carp", name: "草鱼", ascii: "🐡", rarity: "common", category: "fish", value: 15, baseWeight: 75, setId: "jianghu" },
  { id: "crucian", name: "鲫鱼", ascii: "🐟", rarity: "common", category: "fish", value: 10, baseWeight: 85, setId: "jianghu" },
  { id: "silver_carp", name: "鲢鱼", ascii: "🐠", rarity: "uncommon", category: "fish", value: 25, baseWeight: 60, setId: "jianghu" },
  { id: "bighead", name: "鳙鱼", ascii: "🐡", rarity: "uncommon", category: "fish", value: 30, baseWeight: 55, setId: "jianghu" },
  { id: "catfish", name: "鲶鱼", ascii: "🐟", rarity: "uncommon", category: "fish", value: 35, baseWeight: 50 },
  { id: "bass", name: "鲈鱼", ascii: "🐠", rarity: "uncommon", category: "fish", value: 40, baseWeight: 45 },
  { id: "trout", name: "鳟鱼", ascii: "🐡", rarity: "uncommon", category: "fish", value: 38, baseWeight: 48 },

  // 稀有
  { id: "snapper", name: "深海鲷", ascii: "🐟", rarity: "rare", category: "fish", value: 80, baseWeight: 25, setId: "deep_sea", sceneIds: ["starry_sea", "mist_river"] },
  { id: "lanternfish", name: "灯笼鱼", ascii: "🔦", rarity: "rare", category: "fish", value: 90, baseWeight: 22, setId: "deep_sea", sceneIds: ["starry_sea"] },
  { id: "oarfish", name: "皇带鱼", ascii: "🎏", rarity: "rare", category: "fish", value: 120, baseWeight: 18, setId: "deep_sea", sceneIds: ["starry_sea"] },
  { id: "goblin_shark", name: "哥布林鲨", ascii: "🦈", rarity: "rare", category: "fish", value: 150, baseWeight: 15, setId: "deep_sea", sceneIds: ["starry_sea", "volcano_spring"] },
  { id: "vampire_squid", name: "吸血乌贼", ascii: "🦑", rarity: "epic", category: "fish", value: 200, baseWeight: 10, setId: "deep_sea", sceneIds: ["starry_sea"] },

  // 史诗
  { id: "golden_dragon_fish", name: "金龙鱼", ascii: "✨", rarity: "epic", category: "fish", value: 500, baseWeight: 8, setId: "legend_pool" },
  { id: "flying_fish", name: "飞鱼", ascii: "🪽", rarity: "epic", category: "fish", value: 450, baseWeight: 9, setId: "legend_pool" },
  { id: "swordfish", name: "剑鱼", ascii: "🗡️", rarity: "epic", category: "fish", value: 480, baseWeight: 8, setId: "legend_pool" },
  { id: "electric_eel", name: "电鳗", ascii: "⚡", rarity: "epic", category: "fish", value: 520, baseWeight: 7, setId: "legend_pool", sceneIds: ["volcano_spring"] },
  { id: "sperm_whale", name: "抹香鲸", ascii: "🐋", rarity: "epic", category: "fish", value: 600, baseWeight: 6, setId: "legend_pool", sceneIds: ["starry_sea"] },

  // 传奇特殊
  { id: "tiga", name: "迪迦奥特曼", ascii: "🦸", rarity: "legendary", category: "legendary", value: 5000, baseWeight: 3, setId: "crossover", canRaise: true, description: "来自 M78 的光之巨人！" },
  { id: "pikachu", name: "皮卡丘", ascii: "⚡", rarity: "legendary", category: "legendary", value: 4500, baseWeight: 3, setId: "crossover", canRaise: true, description: "皮卡皮卡～十万伏特！" },
  { id: "nezha", name: "哪吒", ascii: "🔥", rarity: "legendary", category: "legendary", value: 4800, baseWeight: 3, setId: "crossover", canRaise: true, description: "我命由我不由天！" },
  { id: "wukong", name: "孙悟空", ascii: "🐵", rarity: "legendary", category: "legendary", value: 5500, baseWeight: 2, setId: "crossover", canRaise: true, description: "齐天大圣，一个跟头十万八千里！" },
  { id: "baize", name: "白泽", ascii: "🦄", rarity: "legendary", category: "legendary", value: 4000, baseWeight: 4, canRaise: true, description: "通晓万物之情的瑞兽。" },
  { id: "qilin", name: "麒麟", ascii: "🦌", rarity: "legendary", category: "legendary", value: 4200, baseWeight: 4, canRaise: true, description: "仁兽现世，国泰民安。" },
  { id: "kunpeng", name: "鲲鹏", ascii: "🌊", rarity: "legendary", category: "legendary", value: 6000, baseWeight: 2, canRaise: true, description: "北冥有鱼，其名为鲲。" },

  // 四神兽
  { id: "qinglong", name: "青龙", ascii: "🐉", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"], description: "东方之神，主春生万物。" },
  { id: "baihu", name: "白虎", ascii: "🐯", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"], description: "西方之神，主秋杀肃降。" },
  { id: "zhuque", name: "朱雀", ascii: "🔥", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"], description: "南方之神，主夏火炎上。" },
  { id: "xuanwu", name: "玄武", ascii: "🐢", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"], description: "北方之神，主冬水润下。" },

  // 装备（钓鱼获得，自动穿戴）
  ...EQUIPMENT.map((eq) => ({
    id: eq.id,
    name: eq.name,
    ascii: eq.ascii,
    rarity: eq.rarity as FishDef["rarity"],
    category: "equipment" as const,
    value: eq.atk * 10 + eq.def * 8 + eq.hp * 2,
    baseWeight: eq.rarity === "legendary" ? 3 : eq.rarity === "epic" ? 8 : 15,
  })),
];

export const FISH_PAGE = {
  eyebrow: "Little game for us",
  heading: "灵渊钓奇",
  subtitle: "在晨曦与星辉之间，钓起江湖水族、上古神兽，甚至迪迦与皮卡丘。集齐图鉴、养成灵兽、勇闯通天塔！",
  castButton: "抛竿！",
  waitingButton: "等待咬钩…",
  reelButton: "收竿！",
  sellAll: "一键出售普通鱼",
  rodUpgrade: "升级鱼竿",
  playerNamePlaceholder: "输入渔夫名号",
  saveNote: "进度保存在本机浏览器，换设备需导出存档。",
  multiplayerNote: "当前为单机本地存档；若要多人同服，需接入后端数据库（未来可扩展）。",
  tabs: {
    fish: "钓鱼",
    codex: "图鉴",
    shop: "商店",
    bag: "背包",
    tower: "通天塔",
  },
} as const;

export const RARITY_LABELS: Record<string, { label: string; color: string }> = {
  common: { label: "普通", color: "text-gray-500" },
  uncommon: { label: "优良", color: "text-green-600" },
  rare: { label: "稀有", color: "text-blue-600" },
  epic: { label: "史诗", color: "text-purple-600" },
  legendary: { label: "传奇", color: "text-orange-500" },
  mythical: { label: "神兽", color: "text-red-600" },
  equipment: { label: "装备", color: "text-cyan-600" },
};
