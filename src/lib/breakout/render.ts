import { BREAKOUT_COLORS } from "@/content/breakout";
import type { BreakoutState, Brick } from "@/lib/breakout/types";

function polarToXY(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

function drawPixelCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  const rr = Math.round(r);
  for (let y = -rr; y <= rr; y++) {
    for (let x = -rr; x <= rr; x++) {
      const d = x * x + y * y;
      if (d <= rr * rr && d >= (rr - 2) * (rr - 2)) {
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
      }
    }
  }
}

function drawRingArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  color: string,
  thickness = 2,
) {
  ctx.fillStyle = color;
  const steps = Math.max(32, Math.ceil(Math.abs(endAngle - startAngle) * 40));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = startAngle + (endAngle - startAngle) * t;
    for (let d = 0; d < thickness; d++) {
      const rr = r - d;
      const x = Math.round(cx + Math.cos(a) * rr);
      const y = Math.round(cy + Math.sin(a) * rr);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawBrick(ctx: CanvasRenderingContext2D, state: BreakoutState, brick: Brick) {
  if (!brick.alive) return;
  const r = state.arenaR * brick.radiusRatio;
  const pos = polarToXY(state.cx, state.cy, r, brick.angle);
  const x = Math.round(pos.x - brick.width / 2);
  const y = Math.round(pos.y - brick.height / 2);
  const w = brick.width;
  const h = brick.height;

  ctx.fillStyle = brick.color;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x, y + h - 2, w, 2);

  if (brick.maxHp > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < brick.hp; i++) {
      ctx.fillRect(x + 3 + i * 5, y + h / 2 - 1, 3, 2);
    }
  }
}

function drawPixelBall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const pattern = [
    [0, 1, 1, 1, 0],
    [1, 2, 2, 2, 1],
    [1, 2, 3, 2, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 1, 1, 0],
  ];
  const colors = ["", BREAKOUT_COLORS.ball, BREAKOUT_COLORS.ballHighlight, "#ffffff"];
  const size = pattern.length;
  const ox = Math.round(x - size / 2);
  const oy = Math.round(y - size / 2);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const c = pattern[row]![col]!;
      if (c === 0) continue;
      ctx.fillStyle = colors[c]!;
      ctx.fillRect(ox + col, oy + row, 1, 1);
    }
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let y = 0; y < size; y += 3) {
    ctx.fillRect(0, y, size, 1);
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, size: number) {
  const grd = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.55);
  grd.addColorStop(0, "rgba(0,0,0,0)");
  grd.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
}

export function renderGame(ctx: CanvasRenderingContext2D, state: BreakoutState) {
  const { size, cx, cy, arenaR, gapHalfAngle, gapPulse } = state;

  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, arenaR);
  bg.addColorStop(0, BREAKOUT_COLORS.bgGradient);
  bg.addColorStop(1, BREAKOUT_COLORS.bg);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  for (const brick of state.bricks) drawBrick(ctx, state, brick);

  for (const t of state.trail) {
    ctx.fillStyle = `rgba(126,200,227,${t.alpha})`;
    ctx.fillRect(Math.round(t.x), Math.round(t.y), 2, 2);
  }

  for (const p of state.particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, p.life * 4);
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    ctx.globalAlpha = 1;
  }

  const gapCenter = Math.PI / 2;
  const gapStart = gapCenter - gapHalfAngle;
  const gapEnd = gapCenter + gapHalfAngle;

  drawPixelCircle(ctx, cx, cy, arenaR + 3, BREAKOUT_COLORS.ringOuter);
  drawRingArc(ctx, cx, cy, arenaR + 1, -Math.PI, gapStart, BREAKOUT_COLORS.ringMain, 3);
  drawRingArc(ctx, cx, cy, arenaR + 1, gapEnd, Math.PI, BREAKOUT_COLORS.ringMain, 3);
  drawRingArc(ctx, cx, cy, arenaR - 1, -Math.PI, gapStart, BREAKOUT_COLORS.ringInner, 1);
  drawRingArc(ctx, cx, cy, arenaR - 1, gapEnd, Math.PI, BREAKOUT_COLORS.ringInner, 1);

  const pulse = 0.4 + Math.sin(gapPulse * 6) * 0.3;
  ctx.globalAlpha = pulse;
  drawRingArc(ctx, cx, cy, arenaR, gapStart, gapEnd, BREAKOUT_COLORS.gapDanger, 2);
  drawRingArc(ctx, cx, cy, arenaR + 2, gapStart, gapEnd, BREAKOUT_COLORS.gapDanger, 1);
  ctx.globalAlpha = 1;

  const px = state.paddle.x;
  const py = state.paddle.y;
  const hw = state.paddle.width / 2;
  const lineW = state.paddleFlash > 0 ? 3 : 2;
  ctx.fillStyle = state.paddleFlash > 0 ? BREAKOUT_COLORS.paddleCatch : BREAKOUT_COLORS.paddle;
  for (let i = -hw; i <= hw; i++) {
    ctx.fillRect(Math.round(px + i), Math.round(py), lineW, lineW);
  }
  ctx.fillStyle = BREAKOUT_COLORS.paddleHighlight;
  ctx.fillRect(Math.round(px - hw), Math.round(py), 2, 2);
  ctx.fillRect(Math.round(px + hw - 1), Math.round(py), 2, 2);

  if (!state.ballAttached || state.phase === "playing") {
    drawPixelBall(ctx, state.ball.x, state.ball.y);
  }

  drawScanlines(ctx, size);
  drawVignette(ctx, size);
}

export function renderOverlay(
  ctx: CanvasRenderingContext2D,
  state: BreakoutState,
  lines: string[],
) {
  ctx.fillStyle = "rgba(15,13,18,0.72)";
  ctx.fillRect(0, 0, state.size, state.size);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = BREAKOUT_COLORS.text;
  ctx.font = "bold 16px monospace";
  lines.forEach((line, i) => {
    ctx.fillText(line, state.size / 2, state.size / 2 - 20 + i * 22);
  });
}
