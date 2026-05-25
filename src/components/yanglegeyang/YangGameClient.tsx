"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LoginPanel } from "@/components/fish/LoginPanel";
import { DockBar } from "@/components/yanglegeyang/DockBar";
import { GameResultModal } from "@/components/yanglegeyang/GameResultModal";
import { GameShell } from "@/components/yanglegeyang/GameShell";
import { LevelHeader } from "@/components/yanglegeyang/LevelHeader";
import { PropBar } from "@/components/yanglegeyang/PropBar";
import { TileBoard } from "@/components/yanglegeyang/TileBoard";
import { YangLeaderboardPanel } from "@/components/yanglegeyang/YangLeaderboardPanel";
import { LOGIC_GRID_COLS, YANG_PAGE, normalizeLevelId } from "@/content/yanglegeyang";
import type { AuthUser } from "@/lib/fish/api";
import { fetchAuth, login, logout, register } from "@/lib/fish/api";
import { fetchCloudSave, pushCloudSave, syncLeaderboard } from "@/lib/yanglegeyang/api";
import {
  ensureDailySeed,
  initLevel,
  pickTile,
  recordLoss,
  recordWin,
  usePropRemove,
  usePropShuffle,
  usePropUndo,
} from "@/lib/yanglegeyang/engine";
import { getClickableUids } from "@/lib/yanglegeyang/occlusion";
import { defaultLevelSeed, getBoardBounds } from "@/lib/yanglegeyang/level-gen";
import { loadSave, persistSave } from "@/lib/yanglegeyang/storage";
import type { GameState, YangSave, YangTab } from "@/lib/yanglegeyang/types";

function newShuffleSeed(levelId: number) {
  return `${levelId}:shuffle:${Date.now()}`;
}

export function YangGameClient() {
  const [save, setSave] = useState<YangSave | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [tab, setTab] = useState<YangTab>("play");
  const [tilePx, setTilePx] = useState(48);
  const [portraitOnly, setPortraitOnly] = useState(false);
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const cloudSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncCloud = useCallback(
    (next: YangSave) => {
      if (!authUser) return;
      if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
      cloudSyncTimer.current = setTimeout(() => {
        pushCloudSave(next).catch(() => {});
      }, 800);
    },
    [authUser],
  );

  const updateSave = useCallback(
    (next: YangSave) => {
      setSave(next);
      persistSave(next);
      syncCloud(next);
      if (next.playerName.trim()) syncLeaderboard(next).catch(() => {});
    },
    [syncCloud],
  );

  const startLevel = useCallback((s: YangSave, levelId: number, seed?: string) => {
    const level = normalizeLevelId(levelId);
    const levelSeed =
      seed ?? s.levelSeeds[level] ?? defaultLevelSeed(level, s.dailySeed, s.totalClears);
    const g = initLevel(level, levelSeed);
    setGame(g);
    if (!s.levelSeeds[level] || s.levelSeeds[level] !== g.seed) {
      const updated = { ...s, levelSeeds: { ...s.levelSeeds, [level]: g.seed } };
      setSave(updated);
      persistSave(updated);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const auth = await fetchAuth();
      if (auth.loggedIn && auth.user) {
        setAuthUser(auth.user);
        const cloud = await fetchCloudSave();
        if (cloud) {
          const withDaily = ensureDailySeed(cloud);
          setSave(withDaily);
          startLevel(withDaily, withDaily.currentLevel);
          return;
        }
      }
      const local = ensureDailySeed(loadSave());
      setSave(local);
      startLevel(local, local.currentLevel);
    })();
  }, [startLevel]);

  useEffect(() => {
    return () => {
      if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = boardWrapRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth || 361;
      setTilePx(Math.max(44, Math.min(52, Math.floor(w / (LOGIC_GRID_COLS / 2)))));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);

  useEffect(() => {
    const check = () => {
      setPortraitOnly(window.matchMedia("(orientation: landscape)").matches && window.innerWidth < 900);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const res = await login(username, password);
    if (!res.ok) return res.error ?? "登录失败";
    setAuthUser(res.user!);
    const cloud = await fetchCloudSave();
    if (cloud) {
      const withDaily = ensureDailySeed(cloud);
      updateSave(withDaily);
      startLevel(withDaily, withDaily.currentLevel);
    }
    return null;
  };

  const handleRegister = async (username: string, password: string, displayName: string) => {
    const res = await register(username, password, displayName);
    if (!res.ok) return res.error ?? "注册失败";
    setAuthUser(res.user!);
    const local = loadSave();
    local.playerName = displayName;
    local.accountId = res.user!.id;
    local.playerId = res.user!.id;
    updateSave(local);
    startLevel(local, local.currentLevel);
    return null;
  };

  const handleLogout = async () => {
    await logout();
    setAuthUser(null);
  };

  const applyGameResult = useCallback(
    (next: GameState) => {
      setGame(next);
      if (!save) return;
      if (next.phase === "won") updateSave(recordWin(save, next.levelId));
      else if (next.phase === "lost") updateSave(recordLoss(save));
    },
    [save, updateSave],
  );

  const handlePick = (uid: string) => {
    if (!game || !save || game.phase !== "playing") return;
    applyGameResult(pickTile(game, uid));
  };

  const handleRestart = () => {
    if (!save || !game) return;
    startLevel(save, game.levelId, game.seed);
  };

  const handleReshuffle = () => {
    if (!save || !game) return;
    const seed = newShuffleSeed(game.levelId);
    const updated = {
      ...save,
      levelSeeds: { ...save.levelSeeds, [game.levelId]: seed },
    };
    updateSave(updated);
    startLevel(updated, game.levelId, seed);
  };


  const handleRetry = () => {
    if (!save) return;
    startLevel(save, save.currentLevel);
  };

  const handleWinNext = () => {
    if (!save) return;
    startLevel(save, save.currentLevel);
  };

  const clickableUids = useMemo(
    () => (game ? getClickableUids(game.board) : new Set<string>()),
    [game],
  );

  const bounds = useMemo(
    () => (game ? getBoardBounds(game.board) : { width: LOGIC_GRID_COLS, height: 6 }),
    [game],
  );

  if (!save || !game) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--mute)]">
        加载中…
      </div>
    );
  }

  return (
    <GameShell>
      {portraitOnly ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--background)] p-6 text-center">
          <p className="text-lg font-medium">{YANG_PAGE.portraitHint}</p>
        </div>
      ) : null}

      <div className="mb-2 flex shrink-0 gap-2">
        {(["play", "rank"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "min-h-[44px] flex-1 rounded-xl py-2 text-sm font-medium ring-1",
              tab === t
                ? "bg-amber-100 ring-amber-300"
                : "bg-white/80 ring-black/[0.06] active:bg-black/[0.03]",
            ].join(" ")}
          >
            {YANG_PAGE.tabs[t]}
          </button>
        ))}
      </div>

      <LoginPanel
        user={authUser}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        compact
      />

      {tab === "rank" ? (
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          <YangLeaderboardPanel currentPlayerId={save.playerId} />
        </div>
      ) : (
        <>
          <LevelHeader
            levelId={game.levelId}
            totalClears={save.totalClears}
            onRestart={handleRestart}
            onReshuffle={handleReshuffle}
          />

          <p className="shrink-0 text-center text-[10px] text-[var(--mute)]">{YANG_PAGE.saveNote}</p>

          <div ref={boardWrapRef} className="flex min-h-0 flex-1 flex-col">
            <TileBoard
              board={game.board}
              clickableUids={clickableUids}
              tilePx={tilePx}
              bounds={bounds}
              onPick={handlePick}
            />
          </div>

          {game.stash.length > 0 ? (
            <div className="shrink-0 text-center text-xs text-[var(--mute)]">
              移出区：{game.stash.length} 张
            </div>
          ) : null}

          <PropBar
            propsRemaining={game.propsRemaining}
            disabled={game.phase !== "playing"}
            onUndo={() => game && applyGameResult(usePropUndo(game))}
            onShuffle={() => game && setGame(usePropShuffle(game))}
            onRemove={() => game && applyGameResult(usePropRemove(game))}
          />

          <DockBar dock={game.dock} />
        </>
      )}

      {game.phase === "won" || game.phase === "lost" ? (
        <GameResultModal
          phase={game.phase}
          levelId={game.levelId}
          onRetry={handleRetry}
          onNext={handleWinNext}
        />
      ) : null}
    </GameShell>
  );
}
