import {
  BASE_PARAMS,
  LOGICAL_SIZE,
  PIXEL_PALETTE,
} from "@/content/breakout";
import type {
  BallTrail,
  BreakoutState,
  Brick,
  BrickKind,
  LevelParams,
  Particle,
} from "@/lib/breakout/types";

const DEG = Math.PI / 180;

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** 可复现伪随机 */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getLevelParams(level: number): LevelParams {
  const lv = Math.max(1, level);
  return {
    ballSpeed: Math.min(
      BASE_PARAMS.ballSpeedMax,
      BASE_PARAMS.ballSpeed + BASE_PARAMS.ballSpeedPerLevel * (lv - 1),
    ),
    paddleWidth: Math.max(
      BASE_PARAMS.paddleWidthMin,
      BASE_PARAMS.paddleWidth + BASE_PARAMS.paddleWidthPerLevel * (lv - 1),
    ),
    gapHalfAngle:
      Math.min(BASE_PARAMS.gapHalfDegMax, BASE_PARAMS.gapHalfDeg + BASE_PARAMS.gapHalfDegPerLevel * (lv - 1)) *
      DEG,
    ringCount: Math.min(
      BASE_PARAMS.ringCountMax,
      BASE_PARAMS.ringCount + Math.floor((lv - 1) / 3) * BASE_PARAMS.ringCountPer3Levels,
    ),
    bricksPerRing: Math.min(
      BASE_PARAMS.bricksPerRingMax,
      Math.round(BASE_PARAMS.bricksPerRing + BASE_PARAMS.bricksPerRingPerLevel * (lv - 1)),
    ),
    specialRatio: Math.min(
      BASE_PARAMS.specialRatioMax,
      BASE_PARAMS.specialRatio + BASE_PARAMS.specialRatioPerLevel * (lv - 1),
    ),
  };
}

function brickColor(rng: () => number): string {
  return PIXEL_PALETTE[Math.floor(rng() * PIXEL_PALETTE.length)]!;
}

function polarToXY(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

function generateBricks(level: number, seed: number): Brick[] {
  const params = getLevelParams(level);
  const rng = seededRandom(seed + level * 7919);
  const bricks: Brick[] = [];
  const gapAvoid = Math.PI / 2;
  const avoidSpan = params.gapHalfAngle + 0.35;

  for (let ring = 0; ring < params.ringCount; ring++) {
    const radiusRatio = 0.32 + ring * 0.1;
    const count = params.bricksPerRing;
    const arcSpan = Math.PI * 1.35;
    const startAngle = -Math.PI / 2 - arcSpan / 2;

    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const angle = startAngle + t * arcSpan;

      const distToGap = Math.abs(Math.atan2(Math.sin(angle - gapAvoid), Math.cos(angle - gapAvoid)));
      if (distToGap < avoidSpan) continue;

      let kind: BrickKind = "normal";
      let hp = 1;
      const roll = rng();
      if (roll < params.specialRatio * 0.4) {
        kind = "gold";
        hp = 3;
      } else if (roll < params.specialRatio) {
        kind = "silver";
        hp = 2;
      }

      const color = kind === "gold" ? "#f39c12" : kind === "silver" ? "#bdc3c7" : brickColor(rng);

      bricks.push({
        id: uid(),
        angle,
        radiusRatio,
        width: 28,
        height: 12,
        hp,
        maxHp: hp,
        kind,
        color,
        alive: true,
      });
    }
  }

  return bricks;
}

/** 圆内底部弦的左右端点 X */
export function getChordBounds(cx: number, arenaR: number, paddleWidth: number) {
  const chordY = cx + arenaR * 0.62;
  const halfChord = Math.sqrt(Math.max(0, arenaR * arenaR - (chordY - cx) * (chordY - cx)));
  const margin = paddleWidth / 2 + 4;
  return { minX: cx - halfChord + margin, maxX: cx + halfChord - margin, chordY };
}

export function createGame(level = 1, seed = Date.now()): BreakoutState {
  const size = LOGICAL_SIZE;
  const cx = size / 2;
  const cy = size / 2;
  const arenaR = size * 0.42;
  const params = getLevelParams(level);
  const { minX, maxX, chordY } = getChordBounds(cx, arenaR, params.paddleWidth);
  const paddleX = (minX + maxX) / 2;

  return {
    phase: "ready",
    level,
    score: 0,
    lives: BASE_PARAMS.lives,
    size,
    cx,
    cy,
    arenaR,
    gapHalfAngle: params.gapHalfAngle,
    ball: { x: paddleX, y: chordY - 14, vx: 0, vy: 0, r: 5 },
    paddle: { x: paddleX, y: chordY, width: params.paddleWidth },
    bricks: generateBricks(level, seed),
    particles: [],
    trail: [],
    ballAttached: true,
    levelClearTimer: 0,
    paddleFlash: 0,
    gapPulse: 0,
    elapsed: 0,
    seed,
  };
}

export function setPaddleX(state: BreakoutState, x: number): BreakoutState {
  const { minX, maxX } = getChordBounds(state.cx, state.arenaR, state.paddle.width);
  const px = Math.max(minX, Math.min(maxX, x));
  const next = { ...state, paddle: { ...state.paddle, x: px } };
  if (next.ballAttached) {
    next.ball = { ...next.ball, x: px };
  }
  return next;
}

export function launchBall(state: BreakoutState): BreakoutState {
  if (!state.ballAttached || state.phase !== "playing") return state;
  const params = getLevelParams(state.level);
  const angle = (-Math.PI / 2 + (Math.random() - 0.5) * 0.4);
  const speed = params.ballSpeed;
  return {
    ...state,
    ballAttached: false,
    ball: {
      ...state.ball,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    },
  };
}

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const nx = x1 + t * dx;
  const ny = y1 + t * dy;
  return Math.hypot(px - nx, py - ny);
}

function normalizeAngle(a: number): number {
  let v = a;
  while (v > Math.PI) v -= Math.PI * 2;
  while (v < -Math.PI) v += Math.PI * 2;
  return v;
}

function isInGap(angle: number, gapHalf: number): boolean {
  const diff = normalizeAngle(angle - Math.PI / 2);
  return Math.abs(diff) < gapHalf;
}

function spawnParticles(state: BreakoutState, x: number, y: number, color: string, count = 6): Particle[] {
  const rng = seededRandom(state.seed + state.elapsed * 1000 + x * 17);
  const parts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const sp = 40 + rng() * 80;
    parts.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0.25 + rng() * 0.2,
      color,
      size: 2 + Math.floor(rng() * 2),
    });
  }
  return parts;
}

function collideBricks(state: BreakoutState): BreakoutState {
  let { ball, score, particles } = state;
  const { bricks } = state;
  let hit = false;

  const nextBricks = bricks.map((brick) => {
    if (!brick.alive || hit) return brick;
    const r = state.arenaR * brick.radiusRatio;
    const pos = polarToXY(state.cx, state.cy, r, brick.angle);
    const bx = pos.x - brick.width / 2;
    const by = pos.y - brick.height / 2;

    const closestX = Math.max(bx, Math.min(ball.x, bx + brick.width));
    const closestY = Math.max(by, Math.min(ball.y, by + brick.height));
    const dist = Math.hypot(ball.x - closestX, ball.y - closestY);

    if (dist < ball.r) {
      hit = true;
      const overlapX = ball.r - Math.abs(ball.x - closestX);
      const overlapY = ball.r - Math.abs(ball.y - closestY);
      if (overlapX < overlapY) ball = { ...ball, vx: -ball.vx };
      else ball = { ...ball, vy: -ball.vy };

      const hp = brick.hp - 1;
      if (hp <= 0) {
        score += BASE_PARAMS.scorePerBrick * state.level * brick.maxHp;
        particles = [...particles, ...spawnParticles(state, pos.x, pos.y, brick.color)];
        return { ...brick, hp: 0, alive: false };
      }
      return { ...brick, hp };
    }
    return brick;
  });

  return { ...state, ball, bricks: nextBricks, score, particles };
}

function collideArena(state: BreakoutState): BreakoutState {
  const { ball, cx, cy, arenaR, gapHalfAngle } = state;
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  if (dist + ball.r < arenaR - 1) return state;

  if (isInGap(angle, gapHalfAngle) && dist + ball.r > arenaR - 3) {
    return loseLife(state);
  }

  if (dist + ball.r >= arenaR) {
    const nx = dx / dist;
    const ny = dy / dist;
    const dot = ball.vx * nx + ball.vy * ny;
    const vx = ball.vx - 2 * dot * nx;
    const vy = ball.vy - 2 * dot * ny;
    const push = arenaR - dist - ball.r - 0.5;
    return {
      ...state,
      ball: {
        x: ball.x + nx * push,
        y: ball.y + ny * push,
        vx,
        vy,
        r: ball.r,
      },
    };
  }

  return state;
}

function collidePaddle(state: BreakoutState): BreakoutState {
  if (state.ballAttached) return state;
  const { ball, paddle } = state;
  const x1 = paddle.x - paddle.width / 2;
  const x2 = paddle.x + paddle.width / 2;
  const dist = distToSegment(ball.x, ball.y, x1, paddle.y, x2, paddle.y);

  if (dist < ball.r + 1 && ball.vy > 0) {
    const params = getLevelParams(state.level);
    const hit = Math.max(-1, Math.min(1, (ball.x - paddle.x) / (paddle.width / 2)));
    const speed = Math.min(
      BASE_PARAMS.ballSpeedMax,
      Math.hypot(ball.vx, ball.vy) * 1.02 + 2,
    );
    const angle = hit * 0.75 - Math.PI / 2;
    const minSpeed = params.ballSpeed * 0.85;
    const finalSpeed = Math.max(minSpeed, speed);
    return {
      ...state,
      ball: {
        ...ball,
        y: paddle.y - ball.r - 1,
        vx: Math.cos(angle) * finalSpeed,
        vy: Math.sin(angle) * finalSpeed,
      },
      paddleFlash: 0.12,
    };
  }
  return state;
}

function loseLife(state: BreakoutState): BreakoutState {
  const lives = state.lives - 1;
  const { chordY } = getChordBounds(state.cx, state.arenaR, state.paddle.width);
  if (lives <= 0) {
    return {
      ...state,
      lives: 0,
      phase: "gameOver",
      ballAttached: true,
      ball: { x: state.paddle.x, y: chordY - 14, vx: 0, vy: 0, r: state.ball.r },
    };
  }
  return {
    ...state,
    lives,
    ballAttached: true,
    ball: { x: state.paddle.x, y: chordY - 14, vx: 0, vy: 0, r: state.ball.r },
  };
}

function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 120 * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}

function updateTrail(state: BreakoutState): BallTrail[] {
  if (state.ballAttached) return [];
  const trail = [{ x: state.ball.x, y: state.ball.y, alpha: 0.5 }, ...state.trail].slice(0, 5);
  return trail.map((t, i) => ({ ...t, alpha: 0.5 - i * 0.1 }));
}

export function tick(state: BreakoutState, dt: number): BreakoutState {
  if (state.phase !== "playing" && state.phase !== "levelClear") {
    return {
      ...state,
      particles: updateParticles(state.particles, dt),
      paddleFlash: Math.max(0, state.paddleFlash - dt),
      gapPulse: state.gapPulse + dt,
    };
  }

  if (state.phase === "levelClear") {
    const levelClearTimer = state.levelClearTimer - dt;
    if (levelClearTimer <= 0) {
      return startNextLevel(state);
    }
    return {
      ...state,
      levelClearTimer,
      particles: updateParticles(state.particles, dt),
      gapPulse: state.gapPulse + dt,
    };
  }

  let next = { ...state, elapsed: state.elapsed + dt, gapPulse: state.gapPulse + dt };
  next.paddleFlash = Math.max(0, next.paddleFlash - dt);
  next.particles = updateParticles(next.particles, dt);

  if (!next.ballAttached) {
    const ball = {
      ...next.ball,
      x: next.ball.x + next.ball.vx * dt,
      y: next.ball.y + next.ball.vy * dt,
    };
    next = { ...next, ball };
    next = collideBricks(next);
    next = collidePaddle(next);
    next = collideArena(next);
    next = { ...next, trail: updateTrail(next) };
  }

  const aliveBricks = next.bricks.filter((b) => b.alive);
  if (aliveBricks.length === 0 && next.phase === "playing") {
    const bonus = BASE_PARAMS.levelBonusMultiplier * next.level;
    return {
      ...next,
      phase: "levelClear",
      score: next.score + bonus,
      levelClearTimer: 1.2,
      ballAttached: true,
      ball: { ...next.ball, vx: 0, vy: 0 },
    };
  }

  return next;
}

export function startNextLevel(state: BreakoutState): BreakoutState {
  const nextLevel = state.level + 1;
  const fresh = createGame(nextLevel, state.seed);
  return {
    ...fresh,
    phase: "playing",
    score: state.score,
    lives: state.lives,
    ballAttached: true,
    elapsed: state.elapsed,
  };
}

export function startPlaying(state: BreakoutState): BreakoutState {
  return { ...state, phase: "playing" };
}

export function togglePause(state: BreakoutState): BreakoutState {
  if (state.phase === "playing") return { ...state, phase: "paused" };
  if (state.phase === "paused") return { ...state, phase: "playing" };
  return state;
}

export function pointerToGameX(state: BreakoutState, clientX: number, canvasRect: DOMRect): number {
  const scale = state.size / canvasRect.width;
  return (clientX - canvasRect.left) * scale;
}
