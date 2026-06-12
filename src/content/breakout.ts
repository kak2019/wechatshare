/** 圆环打砖块 — 文案、调色板、难度常量 */

export const BREAKOUT_PAGE = {
  title: "圆环打砖块",
  eyebrow: "Pixel Breakout",
  subtitle: "在断口的圆环里接住弹球，击碎无限关卡。",
  highScore: "最高分",
  level: "关卡",
  score: "得分",
  lives: "生命",
  start: "开始游戏",
  resume: "继续",
  pause: "暂停",
  restart: "再来一局",
  nextLevel: "下一关",
  tapToLaunch: "轻触发球",
  gameOver: "游戏结束",
  levelClear: "过关！",
  soundOn: "音效：开",
  soundOff: "音效：关",
  portraitHint: "请竖屏游玩，体验更佳",
} as const;

/** NES 风像素调色板 */
export const PIXEL_PALETTE = [
  "#e74c3c",
  "#e67e22",
  "#f1c40f",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#1abc9c",
  "#e84393",
] as const;

export const BREAKOUT_COLORS = {
  bg: "#1a1423",
  bgGradient: "#2d1f3d",
  ringOuter: "#2d2a3e",
  ringMain: "#e8d4a8",
  ringInner: "#fff8e7",
  gapDanger: "#ff6b6b",
  paddle: "#ffd93d",
  paddleHighlight: "#fff8e7",
  paddleCatch: "#ffffff",
  ball: "#7ec8e3",
  ballHighlight: "#d4f1f9",
  silver: "#bdc3c7",
  gold: "#f39c12",
  text: "#e8d4a8",
  textDim: "#8a7a9a",
  hudBg: "#0f0d12",
} as const;

export const LOGICAL_SIZE = 360;

export const BASE_PARAMS = {
  ballSpeed: 180,
  ballSpeedPerLevel: 6,
  ballSpeedMax: 420,
  paddleWidth: 48,
  paddleWidthPerLevel: -0.8,
  paddleWidthMin: 22,
  gapHalfDeg: 10,
  gapHalfDegPerLevel: 0.3,
  gapHalfDegMax: 16,
  ringCount: 2,
  ringCountPer3Levels: 1,
  ringCountMax: 6,
  bricksPerRing: 6,
  bricksPerRingPerLevel: 0.2,
  bricksPerRingMax: 14,
  specialRatio: 0,
  specialRatioPerLevel: 0.02,
  specialRatioMax: 0.35,
  lives: 3,
  scorePerBrick: 100,
  levelBonusMultiplier: 100,
} as const;
