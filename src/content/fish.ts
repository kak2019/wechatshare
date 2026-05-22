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

/** 图鉴套装 */
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
  {
    id: "dragon_balls",
    name: "七龙珠",
    fishIds: ["db_1", "db_2", "db_3", "db_4", "db_5", "db_6", "db_7"],
    bonusLabel: "灵兽全属性 +50/+50/+200",
    rareBonus: 0.2,
    statBonus: { atk: 50, def: 50, hp: 200 },
  },
  {
    id: "gems",
    name: "七彩宝石",
    fishIds: ["gem_ruby", "gem_sapphire", "gem_emerald", "gem_diamond", "gem_amethyst", "gem_topaz", "gem_opal"],
    bonusLabel: "灵兽攻防 +30",
    rareBonus: 0.1,
    statBonus: { atk: 30, def: 30 },
  },
  {
    id: "couple",
    name: "一二 & 布布",
    fishIds: ["yi_er", "bu_bu"],
    bonusLabel: "灵兽生命 +150 · 奇遇 +5%",
    rareBonus: 0.05,
    statBonus: { hp: 150 },
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

/** 七龙珠 */
const DRAGON_BALLS: FishDef[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  id: `db_${n}`,
  name: `${n}星龙珠`,
  ascii: "🔴",
  rarity: "treasure" as const,
  category: "treasure" as const,
  value: 777 * n,
  setId: "dragon_balls",
  baseWeight: 2,
  statBonus: { atk: n * 3, def: n * 2, hp: n * 10 },
  description: `集齐七颗召唤神龙！当前 ${n}/7`,
}));

/** 七彩宝石 */
const GEMS: FishDef[] = [
  { id: "gem_ruby", name: "红宝石", ascii: "♦️", statBonus: { atk: 8 } },
  { id: "gem_sapphire", name: "蓝宝石", ascii: "🔷", statBonus: { def: 8 } },
  { id: "gem_emerald", name: "祖母绿", ascii: "🟩", statBonus: { hp: 25 } },
  { id: "gem_diamond", name: "钻石", ascii: "💠", statBonus: { atk: 5, def: 5, hp: 15 } },
  { id: "gem_amethyst", name: "紫水晶", ascii: "🟣", statBonus: { atk: 6, def: 6 } },
  { id: "gem_topaz", name: "黄玉", ascii: "🟡", statBonus: { def: 10, hp: 10 } },
  { id: "gem_opal", name: "欧泊", ascii: "🌈", statBonus: { atk: 4, def: 4, hp: 20 } },
].map((g) => ({
  ...g,
  rarity: "treasure" as const,
  category: "treasure" as const,
  value: 888,
  setId: "gems",
  baseWeight: 4,
  description: "镶嵌在灵兽身上，永久增加属性。",
}));

/** 奇遇卡片 */
const CARDS: FishDef[] = [
  {
    id: "card_weather",
    name: "天气不错卡",
    ascii: "☀️",
    rarity: "card",
    category: "card",
    value: 0,
    baseWeight: 3,
    cardEffect: "weather",
    description: "使用后全服广播「今天天气不错，适合钓鱼！」，30 分钟内全员稀有度 +10%。",
  },
  {
    id: "card_lucky",
    name: "幸运星卡",
    ascii: "⭐",
    rarity: "card",
    category: "card",
    value: 0,
    baseWeight: 4,
    cardEffect: "lucky",
    description: "下次抛竿必触发奇遇事件。",
  },
  {
    id: "card_double",
    name: "双倍收钩卡",
    ascii: "🪝",
    rarity: "card",
    category: "card",
    value: 0,
    baseWeight: 4,
    cardEffect: "double",
    description: "下一次钓鱼获得双倍金币。",
  },
  {
    id: "card_blessing",
    name: "情侣祝福卡",
    ascii: "💌",
    rarity: "card",
    category: "card",
    value: 0,
    baseWeight: 3,
    cardEffect: "blessing",
    description: "一二 & 布布的祝福：灵兽获得大量经验。",
  },
];

/** 所有可钓物品 */
export const FISH: FishDef[] = [
  // 普通
  { id: "minnow", name: "小银鱼", ascii: "🐟", rarity: "common", category: "fish", value: 5, baseWeight: 100 },
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

  // 传奇
  { id: "tiga", name: "迪迦奥特曼", ascii: "🦸", rarity: "legendary", category: "legendary", value: 5000, baseWeight: 3, setId: "crossover", canRaise: true, description: "来自 M78 的光之巨人！" },
  { id: "pikachu", name: "皮卡丘", ascii: "⚡", rarity: "legendary", category: "legendary", value: 4500, baseWeight: 3, setId: "crossover", canRaise: true, description: "皮卡皮卡～十万伏特！" },
  { id: "nezha", name: "哪吒", ascii: "🔥", rarity: "legendary", category: "legendary", value: 4800, baseWeight: 3, setId: "crossover", canRaise: true, description: "我命由我不由天！" },
  { id: "wukong", name: "孙悟空", ascii: "🐵", rarity: "legendary", category: "legendary", value: 5500, baseWeight: 2, setId: "crossover", canRaise: true, description: "齐天大圣！" },
  { id: "baize", name: "白泽", ascii: "🦄", rarity: "legendary", category: "legendary", value: 4000, baseWeight: 4, canRaise: true },
  { id: "qilin", name: "麒麟", ascii: "🦌", rarity: "legendary", category: "legendary", value: 4200, baseWeight: 4, canRaise: true },
  { id: "kunpeng", name: "鲲鹏", ascii: "🌊", rarity: "legendary", category: "legendary", value: 6000, baseWeight: 2, canRaise: true },

  // 四神兽
  { id: "qinglong", name: "青龙", ascii: "🐉", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"] },
  { id: "baihu", name: "白虎", ascii: "🐯", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"] },
  { id: "zhuque", name: "朱雀", ascii: "🔥", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"] },
  { id: "xuanwu", name: "玄武", ascii: "🐢", rarity: "mythical", category: "beast", value: 88888, baseWeight: 1, setId: "four_beasts", canRaise: true, sceneIds: ["cloud_palace"] },

  // 奇遇奇物 — 越奇妙越好
  { id: "yi_er", name: "一二", ascii: "🧑", rarity: "legendary", category: "treasure", value: 1314, baseWeight: 2, setId: "couple", statBonus: { atk: 20, hp: 80 }, description: "哎呀！钓上来一个人！一二说：「今天也要开心钓鱼哦～」" },
  { id: "bu_bu", name: "布布", ascii: "👧", rarity: "legendary", category: "treasure", value: 1314, baseWeight: 2, setId: "couple", statBonus: { def: 20, hp: 80 }, description: "布布浮在水面：「宝子你钓到我啦！今晚加菜！」" },
  ...DRAGON_BALLS,
  ...GEMS,
  ...CARDS,

  // 整蛊奇遇
  { id: "old_boot", name: "陈年臭靴子", ascii: "👢", rarity: "common", category: "encounter", value: 1, baseWeight: 12, description: "…谁把靴子扔水里的？" },
  { id: "message_bottle", name: "漂流瓶", ascii: "🍾", rarity: "uncommon", category: "encounter", value: 50, baseWeight: 8, description: "瓶中信：「灵渊深处有龙。」" },
  { id: "ufo", name: "微型 UFO", ascii: "🛸", rarity: "epic", category: "encounter", value: 2000, baseWeight: 2, description: "外星文明：「地球钓鱼技术令人震撼。」" },
  { id: "treasure_chest", name: "沉没宝箱", ascii: "🎁", rarity: "rare", category: "encounter", value: 500, baseWeight: 6, description: "开箱：金币叮当响！" },
  { id: "golden_lotus", name: "金莲花", ascii: "🪷", rarity: "epic", category: "treasure", value: 1688, baseWeight: 3, statBonus: { atk: 15, def: 15, hp: 40 }, description: "佛缘降临，灵兽心境通透。" },
  { id: "phoenix_feather", name: "凤凰羽毛", ascii: "🪶", rarity: "legendary", category: "treasure", value: 3333, baseWeight: 2, statBonus: { atk: 25, hp: 60 }, description: "浴火重生之力附着其上。" },
  { id: "dragon_scale", name: "龙鳞", ascii: "🐲", rarity: "legendary", category: "treasure", value: 4000, baseWeight: 2, statBonus: { def: 35, hp: 50 }, description: "一片鳞，千斤重。" },
  { id: "time_fish", name: "时之鱼", ascii: "⏳", rarity: "legendary", category: "encounter", value: 3000, baseWeight: 2, description: "它游过的地方，时间慢了一秒。" },
  { id: "quantum_shrimp", name: "量子小虾", ascii: "🦐", rarity: "epic", category: "encounter", value: 999, baseWeight: 3, description: "同时存在于收竿前与收竿后。" },
  { id: "singing_whale", name: "唱歌的鲸鱼", ascii: "🎵", rarity: "rare", category: "encounter", value: 300, baseWeight: 5, description: "它唱：「～～～今天天气不错～～～」" },

  // 装备
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
  subtitle: "钓江湖水族、上古神兽、七龙珠与宝石；一二布布也会上钩！集图鉴、养神兽、闯通天塔、争排行榜。",
  castButton: "抛竿！",
  waitingButton: "等待咬钩…",
  reelButton: "收竿！",
  sellAll: "一键出售普通鱼",
  rodUpgrade: "升级鱼竿",
  playerNamePlaceholder: "输入你的渔夫名（排行榜用）",
  saveNote: "游戏进度保存在本机；排行榜与全服事件同步到服务器。",
  multiplayerNote: "输入名字后自动上传排行榜。钓到神兽/使用天气不错卡会全服广播！",
  tabs: {
    fish: "钓鱼",
    codex: "图鉴",
    shop: "商店",
    bag: "背包",
    tower: "通天塔",
    rank: "排行榜",
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
  treasure: { label: "宝物", color: "text-amber-600" },
  card: { label: "卡片", color: "text-pink-600" },
};
