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
export function getLevelDifficulty(levelId: number): LevelDifficulty {
  if (levelId <= 1) {
    return {
      layers: 2,
      typeCount: 3,
      tilesPerLayer: [6, 3],
      jitter: 0.15,
      maxTypeSpread: false,
      denseStack: false,
    };
  }
  if (levelId === 2) {
    return {
      layers: 5,
      typeCount: 12,
      tilesPerLayer: [10, 11, 12, 11, 10],
      jitter: 0.12,
      maxTypeSpread: true,
      denseStack: true,
    };
  }
  if (levelId <= 4) {
    return {
      layers: 6,
      typeCount: 12,
      tilesPerLayer: [11, 11, 11, 11, 11, 11],
      jitter: 0.12,
      maxTypeSpread: true,
      denseStack: true,
    };
  }
  if (levelId <= 8) {
    return {
      layers: 6,
      typeCount: 12,
      tilesPerLayer: [12, 12, 12, 12, 12, 12],
      jitter: 0.1,
      maxTypeSpread: true,
      denseStack: true,
    };
  }
  const extra = Math.min(2, Math.floor((levelId - 8) / 3));
  return {
    layers: 6 + extra,
    typeCount: 12,
    tilesPerLayer: [],
    jitter: 0.08,
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
  subtitle: "第 1 关热热身，第 2 关开始才是真正的羊了个羊…",
  tabs: { play: "游戏", rank: "排行榜" },
  levelLabel: (n: number) => `第 ${n} 关`,
  restart: "重开本关",
  shuffle: "重新洗牌",
  props: {
    undo: "撤回",
    shuffle: "洗牌",
    remove: "移出",
  },
  propHint: "每关各 1 次",
  winTitle: "过关啦！",
  winBody: "太厉害了，进入下一关？",
  loseTitle: "槽位满了",
  loseBody: "别灰心，正版第二关就是这么难！",
  nextLevel: "下一关",
  retry: "再试一次",
  dockFull: "槽位已满",
  saveNote: "登录后进度云存档，与钓鱼游戏共用账号。",
  rankTitle: "🏆 羊羊排行榜",
  rankHint: "按最高关卡 → 胜场 → 通关数排序",
  portraitHint: "请旋转至竖屏游玩",
} as const;

export const PROPS_PER_LEVEL = { undo: 1, shuffle: 1, remove: 1 } as const;

export const LOGIC_GRID_COLS = 7;
export const TILE_LOGIC_SIZE = 2;
export const MAX_DOCK = 7;
