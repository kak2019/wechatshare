/** 羊了个羊 — 牌型、关卡难度、页面文案 */

export interface TileTypeDef {
  id: string;
  emoji: string;
  label: string;
}

export const TILE_TYPES: TileTypeDef[] = [
  { id: "sheep", emoji: "🐑", label: "羊" },
  { id: "carrot", emoji: "🥕", label: "萝卜" },
  { id: "corn", emoji: "🌽", label: "玉米" },
  { id: "bucket", emoji: "🪣", label: "水桶" },
  { id: "glove", emoji: "🧤", label: "手套" },
  { id: "hay", emoji: "🌾", label: "草垛" },
  { id: "fire", emoji: "🔥", label: "篝火" },
  { id: "barn", emoji: "🏠", label: "谷仓" },
  { id: "tree", emoji: "🌳", label: "树" },
  { id: "flower", emoji: "🌻", label: "花" },
  { id: "bell", emoji: "🔔", label: "铃铛" },
  { id: "wool", emoji: "🧶", label: "毛线" },
];

export interface LevelDifficulty {
  layers: number;
  typeCount: number;
  tilesPerLayer: number[];
  jitter: number;
  /** 尽量每种牌只出现 3 张，增加槽位压力 */
  maxTypeSpread: boolean;
  /** 更紧密堆叠、遮挡更重 */
  denseStack: boolean;
}

/**
 * 难度曲线对齐正版：第 1 关教学，第 2 关起断崖式加难。
 */

/** 第二关层带：顶层易 → 中层 → 底层难 */
export const LEVEL2_LAYER_BANDS = [
  { layers: [5, 4], typeCount: 3, mode: "easy" as const },
  { layers: [3, 2], typeCount: 6, mode: "medium" as const },
  { layers: [1, 0], typeCount: 12, mode: "hard" as const },
];

/** 正版仅两关：第 1 关教学 + 第 2 关超难 */
export const MAX_GAME_LEVEL = 2;

export function normalizeLevelId(levelId: number): 1 | 2 {
  return levelId <= 1 ? 1 : 2;
}

export function getLevelDifficulty(levelId: number): LevelDifficulty {
  const level = normalizeLevelId(levelId);
  if (level === 1) {
    return {
      layers: 2,
      typeCount: 3,
      tilesPerLayer: [6, 3],
      jitter: 0.15,
      maxTypeSpread: false,
      denseStack: false,
    };
  }
  return {
    layers: 6,
    typeCount: 12,
    tilesPerLayer: [],
    jitter: 0.12,
    maxTypeSpread: true,
    denseStack: true,
  };
}

/** 第 1 关固定坐标模板（逻辑格，牌占 2×2） */
export const TUTORIAL_LAYOUT: { layer: number; x: number; y: number }[] = [
  { layer: 0, x: 0.5, y: 1 },
  { layer: 0, x: 2.5, y: 1 },
  { layer: 0, x: 4.5, y: 1 },
  { layer: 0, x: 1.5, y: 3 },
  { layer: 0, x: 3.5, y: 3 },
  { layer: 0, x: 2.5, y: 5 },
  { layer: 1, x: 1.5, y: 2 },
  { layer: 1, x: 3.5, y: 2 },
  { layer: 1, x: 2.5, y: 4 },
];

export const YANG_PAGE = {
  eyebrow: "Little game for us",
  heading: "羊了个羊",
  subtitle: "正版两关：过第一关才能进第二关，通关后可再来一轮。",
  tabs: { play: "游戏", rank: "排行榜" },
  levelLabel: (n: number) => (n <= 1 ? "第一关 · 热身" : "第二关 · 渐进"),
  roundLabel: (n: number) => `已通关 ${n} 轮`,
  restart: "重开本关",
  shuffle: "重新洗牌",
  props: {
    undo: "撤回",
    shuffle: "洗牌",
    remove: "移出",
  },
  propHint: "每关各 1 次",
  winTitleLevel1: "第一关通过！",
  winBodyLevel1: "第二关开头不难，越往后越考验…",
  winTitleLevel2: "羊了个羊通关！",
  winBodyLevel2: "太狠了！要不再来一轮？",
  loseTitle: "槽位满了",
  loseBody: "没事，从第一关重新来——后面那几层才是考验！",
  enterLevel2: "进入第二关",
  playAgain: "再来一轮",
  retry: "从第一关重来",
  dockFull: "槽位已满",
  saveNote: "登录后进度云存档，与钓鱼游戏共用账号。",
  rankTitle: "🏆 羊羊排行榜",
  rankHint: "按通关轮数 → 胜场 → 胜率排序",
  portraitHint: "请旋转至竖屏游玩",
} as const;

export const PROPS_PER_LEVEL = { undo: 1, shuffle: 1, remove: 1 } as const;

export const LOGIC_GRID_COLS = 7;
export const TILE_LOGIC_SIZE = 2;
export const MAX_DOCK = 7;
