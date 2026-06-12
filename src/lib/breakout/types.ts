export type GamePhase = "ready" | "playing" | "paused" | "levelClear" | "gameOver";

export type BrickKind = "normal" | "silver" | "gold";

export interface Brick {
  id: string;
  /** 弧砖中心角（弧度，0=右，π/2=下） */
  angle: number;
  /** 距圆心的半径比例 0~1 */
  radiusRatio: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  kind: BrickKind;
  color: string;
  alive: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface BallTrail {
  x: number;
  y: number;
  alpha: number;
}

export interface BreakoutState {
  phase: GamePhase;
  level: number;
  score: number;
  lives: number;
  /** 逻辑画布尺寸 */
  size: number;
  cx: number;
  cy: number;
  arenaR: number;
  gapHalfAngle: number;
  ball: { x: number; y: number; vx: number; vy: number; r: number };
  paddle: { x: number; y: number; width: number };
  bricks: Brick[];
  particles: Particle[];
  trail: BallTrail[];
  /** 球粘在挡板上等待发球 */
  ballAttached: boolean;
  levelClearTimer: number;
  paddleFlash: number;
  gapPulse: number;
  elapsed: number;
  seed: number;
}

export interface BreakoutSave {
  version: 1;
  highScore: number;
  maxLevel: number;
  totalBricks: number;
  soundOn: boolean;
}

export interface LevelParams {
  ballSpeed: number;
  paddleWidth: number;
  gapHalfAngle: number;
  ringCount: number;
  bricksPerRing: number;
  specialRatio: number;
}
