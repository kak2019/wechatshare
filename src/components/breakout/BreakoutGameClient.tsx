"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BREAKOUT_PAGE } from "@/content/breakout";
import { GameShell } from "@/components/yanglegeyang/GameShell";
import {
  createGame,
  launchBall,
  pointerToGameX,
  setPaddleX,
  startPlaying,
  tick,
  togglePause,
} from "@/lib/breakout/engine";
import { renderGame, renderOverlay } from "@/lib/breakout/render";
import { createDefaultSave, loadSave, persistSave } from "@/lib/breakout/storage";
import type { BreakoutSave, BreakoutState } from "@/lib/breakout/types";

function formatScore(n: number) {
  return n.toLocaleString("zh-CN");
}

function applyState(
  next: BreakoutState,
  setGame: (g: BreakoutState) => void,
  stateRef: React.MutableRefObject<BreakoutState | null>,
) {
  stateRef.current = next;
  setGame(next);
}

export function BreakoutGameClient() {
  const [game, setGame] = useState<BreakoutState>(() => createGame(1));
  const [save, setSave] = useState<BreakoutSave>(() => createDefaultSave());
  const [portraitOnly, setPortraitOnly] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BreakoutState>(game);
  const saveRef = useRef<BreakoutSave | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const s = loadSave();
    saveRef.current = s;
    const id = requestAnimationFrame(() => setSave(s));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    const check = () => {
      setPortraitOnly(
        window.matchMedia("(orientation: landscape)").matches && window.innerWidth < 900,
      );
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const commitSave = useCallback((state: BreakoutState) => {
    const prev = saveRef.current ?? loadSave();
    const bricksBroken = state.bricks.filter((b) => !b.alive).length;
    const next: BreakoutSave = {
      ...prev,
      highScore: Math.max(prev.highScore, state.score),
      maxLevel: Math.max(prev.maxLevel, state.level),
      totalBricks: prev.totalBricks + bricksBroken,
    };
    setSave(next);
    saveRef.current = next;
    persistSave(next);
  }, []);

  const handleStart = useCallback(() => {
    const state = stateRef.current;
    if (!state || state.phase !== "ready") return;
    applyState(startPlaying(state), setGame, stateRef);
  }, []);

  const handlePause = useCallback(() => {
    const state = stateRef.current;
    if (!state) return;
    applyState(togglePause(state), setGame, stateRef);
  }, []);

  const handleRestart = useCallback(() => {
    applyState(startPlaying(createGame(1)), setGame, stateRef);
  }, []);

  const handlePointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;
    const rect = canvas.getBoundingClientRect();
    const x = pointerToGameX(state, clientX, rect);
    applyState(setPaddleX(state, x), setGame, stateRef);
  }, []);

  const handleTap = useCallback(() => {
    const state = stateRef.current;
    if (!state) return;

    if (state.phase === "gameOver") {
      handleRestart();
      return;
    }
    if (state.phase === "ready") {
      handleStart();
      return;
    }
    if (state.phase === "paused") {
      handlePause();
      return;
    }
    if (state.ballAttached && state.phase === "playing") {
      applyState(launchBall(state), setGame, stateRef);
    }
  }, [handlePause, handleRestart, handleStart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerMove = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state || state.phase === "ready" || state.phase === "gameOver") return;
      handlePointer(e.clientX);
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      handleTap();
      const state = stateRef.current;
      if (state?.phase === "playing" || state?.phase === "paused") {
        handlePointer(e.clientX);
      }
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, [handlePointer, handleTap, game.size]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const state = stateRef.current;
      if (!state) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleTap();
      }
      if (e.key === "p" || e.key === "P") handlePause();
      if (state.phase !== "playing" && state.phase !== "paused") return;
      const step = 18;
      if (e.key === "ArrowLeft") {
        applyState(setPaddleX(state, state.paddle.x - step), setGame, stateRef);
      }
      if (e.key === "ArrowRight") {
        applyState(setPaddleX(state, state.paddle.x + step), setGame, stateRef);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePause, handleTap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    lastTimeRef.current = 0;
    let hudTick = 0;

    const draw = (now: number) => {
      const state = stateRef.current;
      if (!state) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min(0.033, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const prevPhase = state.phase;
      const next = tick(state, dt);
      if (next.phase === "gameOver" && prevPhase !== "gameOver") commitSave(next);
      stateRef.current = next;

      hudTick += 1;
      if (hudTick % 6 === 0 || next.phase !== state.phase) {
        setGame(next);
      }

      ctx.imageSmoothingEnabled = false;
      renderGame(ctx, next);

      if (next.phase === "ready") {
        renderOverlay(ctx, next, [BREAKOUT_PAGE.title, BREAKOUT_PAGE.start]);
      } else if (next.phase === "paused") {
        renderOverlay(ctx, next, [BREAKOUT_PAGE.pause, BREAKOUT_PAGE.resume]);
      } else if (next.phase === "levelClear") {
        renderOverlay(ctx, next, [BREAKOUT_PAGE.levelClear, `第 ${next.level} 关`]);
      } else if (next.phase === "gameOver") {
        renderOverlay(ctx, next, [
          BREAKOUT_PAGE.gameOver,
          `${BREAKOUT_PAGE.score} ${formatScore(next.score)}`,
          BREAKOUT_PAGE.restart,
        ]);
      } else if (next.ballAttached) {
        ctx.fillStyle = "rgba(232,212,168,0.85)";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(BREAKOUT_PAGE.tapToLaunch, next.size / 2, next.size - 28);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [commitSave, game.size]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = () => {
      const w = wrap.clientWidth;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${w}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const toggleSound = () => {
    setSave((prev) => {
      const next = { ...prev, soundOn: !prev.soundOn };
      persistSave(next);
      saveRef.current = next;
      return next;
    });
  };

  return (
    <GameShell>
      {portraitOnly ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--background)] p-6 text-center">
          <p className="text-lg font-medium">{BREAKOUT_PAGE.portraitHint}</p>
        </div>
      ) : null}

      <header className="mb-3 shrink-0 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--mute)]">
          {BREAKOUT_PAGE.eyebrow}
        </p>
        <h1 className="font-mono text-lg font-bold tracking-tight">{BREAKOUT_PAGE.title}</h1>
        <p className="mt-1 text-xs text-[var(--mute)]">{BREAKOUT_PAGE.subtitle}</p>
      </header>

      <div ref={wrapRef} className="mx-auto w-full max-w-[400px] flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          width={game.size}
          height={game.size}
          className="block w-full rounded-lg border-2 border-[#2d2a3e] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          style={{ imageRendering: "pixelated", touchAction: "none" }}
          aria-label={BREAKOUT_PAGE.title}
        />
      </div>

      <div className="mt-3 grid shrink-0 grid-cols-4 gap-2 font-mono text-xs">
        <div className="rounded-lg bg-[#1a1423] px-2 py-2 text-center text-[#e8d4a8]">
          <div className="text-[10px] text-[#8a7a9a]">{BREAKOUT_PAGE.level}</div>
          <div className="text-base font-bold">{game.level}</div>
        </div>
        <div className="rounded-lg bg-[#1a1423] px-2 py-2 text-center text-[#e8d4a8]">
          <div className="text-[10px] text-[#8a7a9a]">{BREAKOUT_PAGE.score}</div>
          <div className="text-base font-bold">{formatScore(game.score)}</div>
        </div>
        <div className="rounded-lg bg-[#1a1423] px-2 py-2 text-center text-[#e8d4a8]">
          <div className="text-[10px] text-[#8a7a9a]">{BREAKOUT_PAGE.lives}</div>
          <div className="text-base font-bold">{"❤".repeat(game.lives) || "—"}</div>
        </div>
        <div className="rounded-lg bg-[#1a1423] px-2 py-2 text-center text-[#e8d4a8]">
          <div className="text-[10px] text-[#8a7a9a]">{BREAKOUT_PAGE.highScore}</div>
          <div className="text-base font-bold">{formatScore(save.highScore)}</div>
        </div>
      </div>

      <div className="mt-3 flex shrink-0 gap-2">
        {game.phase === "playing" || game.phase === "paused" ? (
          <button
            type="button"
            onClick={handlePause}
            className="flex-1 rounded-lg border border-[#2d2a3e] bg-[#1a1423] px-3 py-2 font-mono text-sm text-[#e8d4a8] active:scale-95"
          >
            {game.phase === "paused" ? BREAKOUT_PAGE.resume : BREAKOUT_PAGE.pause}
          </button>
        ) : (
          <button
            type="button"
            onClick={game.phase === "gameOver" ? handleRestart : handleStart}
            className="flex-1 rounded-lg border border-[#ffd93d] bg-[#2d1f3d] px-3 py-2 font-mono text-sm font-bold text-[#ffd93d] active:scale-95"
          >
            {game.phase === "gameOver" ? BREAKOUT_PAGE.restart : BREAKOUT_PAGE.start}
          </button>
        )}
        <button
          type="button"
          onClick={toggleSound}
          className="rounded-lg border border-[#2d2a3e] bg-[#1a1423] px-3 py-2 font-mono text-xs text-[#8a7a9a] active:scale-95"
        >
          {save.soundOn ? BREAKOUT_PAGE.soundOn : BREAKOUT_PAGE.soundOff}
        </button>
      </div>
    </GameShell>
  );
}
