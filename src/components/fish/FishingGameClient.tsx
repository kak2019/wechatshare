"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { BonusInfo } from "@/components/fish/BonusInfo";
import { FishArt } from "@/components/fish/FishArt";
import { GlobalTicker } from "@/components/fish/GlobalTicker";
import { LeaderboardPanel } from "@/components/fish/LeaderboardPanel";
import { LoginPanel } from "@/components/fish/LoginPanel";
import { CODEX_SETS, FISH, FISH_PAGE, RARITY_LABELS, SCENES } from "@/content/fish";
import type { AuthUser } from "@/lib/fish/api";
import {
  broadcastCatch,
  fetchAuth,
  fetchCloudSave,
  fetchGlobalEvents,
  login,
  logout,
  pushCloudSave,
  register,
  syncLeaderboard,
  useWeatherCard,
} from "@/lib/fish/api";
import {
  applyEncounter,
  exportSave,
  getCatchRateDisplay,
  getCompletedSets,
  getFishById,
  getEquipmentById,
  getUnitStats,
  importSave,
  maybeTriggerEncounter,
  processCatch,
  rollCatch,
  rodUpgradeCost,
  runTowerBattle,
  sellAllCommon,
  sellFish,
  shouldBroadcastCatch,
  upgradeRod,
  useCard,
} from "@/lib/fish/engine";
import { loadSave, persistSave } from "@/lib/fish/storage";
import type { CatchResult, GameSave, GameTab, GlobalEvent, TowerBattleResult } from "@/lib/fish/types";

type FishPhase = "idle" | "casting" | "waiting" | "bite" | "reeling" | "caught";

const TABS: { id: GameTab; label: string }[] = [
  { id: "fish", label: FISH_PAGE.tabs.fish },
  { id: "codex", label: FISH_PAGE.tabs.codex },
  { id: "shop", label: FISH_PAGE.tabs.shop },
  { id: "bag", label: FISH_PAGE.tabs.bag },
  { id: "tower", label: FISH_PAGE.tabs.tower },
  { id: "rank", label: FISH_PAGE.tabs.rank },
];

function formatGold(n: number) {
  return n.toLocaleString("zh-CN");
}

export function FishingGameClient() {
  const [save, setSave] = useState<GameSave | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [tab, setTab] = useState<GameTab>("fish");
  const [phase, setPhase] = useState<FishPhase>("idle");
  const [logs, setLogs] = useState<string[]>(["欢迎来到灵渊钓奇！登录后进度云存档。"]);
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [towerResult, setTowerResult] = useState<TowerBattleResult | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [globalEvents, setGlobalEvents] = useState<GlobalEvent[]>([]);
  const [weatherActive, setWeatherActive] = useState(false);
  const [weatherBuffBy, setWeatherBuffBy] = useState("");
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const biteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingEncounter = useRef<ReturnType<typeof maybeTriggerEncounter>>(null);
  const cloudSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshEvents = useCallback(async () => {
    const data = await fetchGlobalEvents();
    if (!data) return;
    setGlobalEvents(data.events);
    setWeatherActive(data.weatherActive);
    setWeatherBuffBy(data.weatherBuffBy);
  }, []);

  const syncCloud = useCallback((next: GameSave) => {
    if (!authUser) return;
    if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
    cloudSyncTimer.current = setTimeout(() => {
      pushCloudSave(next).catch(() => {});
    }, 800);
  }, [authUser]);

  const updateSave = useCallback((next: GameSave) => {
    setSave(next);
    persistSave(next);
    syncCloud(next);
    if (next.playerName.trim()) syncLeaderboard(next).catch(() => {});
  }, [syncCloud]);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [msg, ...prev].slice(0, 60));
  }, []);

  const clearTimers = useCallback(() => {
    if (waitTimer.current) clearTimeout(waitTimer.current);
    if (biteTimer.current) clearTimeout(biteTimer.current);
  }, []);

  useEffect(() => () => {
    clearTimers();
    if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
  }, [clearTimers]);

  useEffect(() => {
    (async () => {
      const auth = await fetchAuth();
      if (auth.loggedIn && auth.user) {
        setAuthUser(auth.user);
        const cloud = await fetchCloudSave();
        if (cloud) {
          setSave(cloud);
          addLog(`☁️ 欢迎回来，${auth.user.displayName}！`);
          return;
        }
      }
      setSave(loadSave());
    })();
    refreshEvents();
    const t = setInterval(refreshEvents, 20000);
    return () => clearInterval(t);
  }, [refreshEvents, addLog]);

  const handleLogin = async (username: string, password: string) => {
    const res = await login(username, password);
    if (!res.ok) return res.error ?? "登录失败";
    setAuthUser(res.user!);
    const cloud = await fetchCloudSave();
    if (cloud) {
      updateSave(cloud);
      addLog(`✅ 登录成功，已加载云存档`);
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
    addLog(`🎉 注册成功！进度已同步到云端`);
    return null;
  };

  const handleLogout = async () => {
    await logout();
    setAuthUser(null);
    addLog("已退出登录，本地进度仍保留");
  };

  const cast = () => {
    if (!save || phase !== "idle") return;
    clearTimers();
    setPhase("casting");
    setLastCatch(null);

    const enc = maybeTriggerEncounter(save);
    pendingEncounter.current = enc;
    if (enc) {
      updateSave(applyEncounter(save, enc));
      addLog(`${enc.ascii} 奇遇：${enc.name}！`);
    }

    waitTimer.current = setTimeout(() => {
      setPhase("waiting");
      waitTimer.current = setTimeout(() => {
        setPhase("bite");
        addLog("❗ 咬钩了！快收竿！");
        biteTimer.current = setTimeout(() => {
          setPhase("idle");
          pendingEncounter.current = null;
          addLog("💨 鱼跑了…");
        }, 3500);
      }, 400 + Math.random() * 600);
    }, 350);
  };

  const reel = () => {
    if (!save || phase !== "bite") return;
    clearTimers();
    setPhase("reeling");
    const enc = pendingEncounter.current ?? undefined;
    pendingEncounter.current = null;

    setTimeout(async () => {
      const fish = rollCatch(save, { weatherBuff: weatherActive });
      let { save: next, result } = processCatch(save, fish, enc ?? undefined);
      if (save.activeEncounter?.id === "double_gold" || next.activeEncounter?.id === "double_gold") {
        next = { ...next, gold: next.gold + fish.value };
        result = { ...result, message: result.message + " （双倍金币！）" };
      }
      updateSave(next);
      setLastCatch(result);
      addLog(result.message);
      setPhase("caught");

      if (shouldBroadcastCatch(fish) && next.playerName.trim()) {
        broadcastCatch(next.playerName, `${next.playerName} 钓到了 ${fish.ascii}${fish.name}！`, fish.id.startsWith("db_") ? "dragon" : "catch");
        refreshEvents();
      }
      setTimeout(() => setPhase("idle"), 900);
    }, 300);
  };

  const handleUseCard = async (cardId: string) => {
    if (!save) return;
    const res = useCard(save, cardId);
    if (!res) return addLog("❌ 没有这张卡片");
    updateSave(res.save);
    if (res.effect === "weather_broadcast") {
      if (!save.playerName.trim()) return addLog("⚠️ 需要名字才能广播");
      await useWeatherCard(save.playerName);
      addLog("☀️ 天气不错卡已使用！");
      refreshEvents();
    } else addLog(`🃏 ${res.effect}`);
  };

  const handleSell = (uid: string) => {
    if (!save) return;
    const fish = getFishById(save.inventory.find((i) => i.uid === uid)?.fishId ?? "");
    updateSave(sellFish(save, uid));
    if (fish) addLog(`💰 出售 ${fish.name} +${fish.value}`);
  };

  const handleSellAll = () => {
    if (!save) return;
    const next = sellAllCommon(save);
    addLog(`💰 批量出售 +${next.gold - save.gold}`);
    updateSave(next);
  };

  const handleUpgrade = () => {
    if (!save) return;
    const next = upgradeRod(save);
    if (!next) return addLog(`❌ 需要 ${formatGold(rodUpgradeCost(save.rodLevel))} 金`);
    updateSave(next);
    addLog(`🔧 鱼竿 Lv.${next.rodLevel}`);
  };

  const handleTower = () => {
    if (!save?.selectedBeastId) return addLog("❌ 请选择 Lv.3+ 灵兽");
    const beast = save.beasts.find((b) => b.uid === save.selectedBeastId);
    if (!beast || beast.level < 3) return addLog("❌ 灵兽需 Lv.3+");
    const result = runTowerBattle(save, save.selectedBeastId);
    if (!result) return;
    updateSave(result.save);
    setTowerResult(result.result);
    result.result.log.forEach(addLog);
  };

  if (!save) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--mute)]">加载中…</div>;
  }

  const scene = SCENES.find((s) => s.id === save.currentScene) ?? SCENES[0];
  const selectedBeast = save.beasts.find((b) => b.uid === save.selectedBeastId);
  const completedSets = getCompletedSets(save.codex);
  const bonusText = getCatchRateDisplay(save, weatherActive);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--mute)]">{FISH_PAGE.eyebrow}</p>
        <h1 className="mt-2 font-hand-zh text-4xl font-bold md:text-5xl">
          <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">{FISH_PAGE.heading}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--mute)]">{FISH_PAGE.subtitle}</p>
      </div>

      <LoginPanel user={authUser} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout} />
      <GlobalTicker events={globalEvents} weatherActive={weatherActive} weatherBuffBy={weatherBuffBy} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/[0.05]">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>👤 <input className="w-28 border-b border-dashed border-gray-300 bg-transparent outline-none focus:border-teal-400" value={save.playerName} onChange={(e) => updateSave({ ...save, playerName: e.target.value })} placeholder={FISH_PAGE.playerNamePlaceholder} /></span>
          <span className="font-semibold text-amber-600">💰 {formatGold(save.gold)}</span>
          <span className="text-[var(--mute)]">🎣 Lv.{save.rodLevel}</span>
          <span className="text-[var(--mute)]">🏯 {save.towerFloor}层</span>
          {save.dragonBalls.length > 0 && <span className="text-red-500">🔴 {save.dragonBalls.length}/7</span>}
        </div>
        <div className="flex items-center gap-2">
          <BonusInfo text={bonusText} />
          <button type="button" onClick={() => setShowExport(!showExport)} className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-black/[0.08]">存档</button>
        </div>
      </div>

      {showExport && (
        <div className="mb-4 rounded-2xl bg-amber-50/80 p-4 text-xs text-[var(--mute)] ring-1 ring-amber-200">
          <p>{authUser ? "☁️ 已登录：进度自动保存到服务器。" : FISH_PAGE.saveNote}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="rounded-lg bg-white px-3 py-1.5 ring-1" onClick={() => { void navigator.clipboard.writeText(exportSave(save)); addLog("📋 已复制"); }}>导出 JSON</button>
            <button type="button" className="rounded-lg bg-white px-3 py-1.5 ring-1" onClick={() => { const raw = prompt("粘贴存档"); if (!raw) return; const imp = importSave(raw); if (imp) updateSave(imp); }}>导入</button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={["rounded-full px-4 py-2 text-sm font-medium", tab === t.id ? "bg-teal-600 text-white shadow-md" : "bg-white text-[var(--mute)] ring-1 ring-black/[0.08]"].join(" ")}>{t.label}</button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {tab === "fish" && (
            <FishingPanel save={save} scene={scene} phase={phase} lastCatch={lastCatch} onCast={cast} onReel={reel} onSceneChange={(id) => updateSave({ ...save, currentScene: id })} />
          )}
          {tab === "codex" && <CodexPanel codex={save.codex} completedSets={completedSets} dragonBalls={save.dragonBalls} />}
          {tab === "shop" && <ShopPanel gold={save.gold} rodLevel={save.rodLevel} upgradeCost={rodUpgradeCost(save.rodLevel)} onUpgrade={handleUpgrade} />}
          {tab === "bag" && <BagPanel inventory={save.inventory} cards={save.cards} onSell={handleSell} onSellAll={handleSellAll} onUseCard={handleUseCard} />}
          {tab === "tower" && <TowerPanel towerFloor={save.towerFloor} selectedBeast={selectedBeast} permanentBonus={save.permanentBonus} towerResult={towerResult} onChallenge={handleTower} />}
          {tab === "rank" && <LeaderboardPanel currentPlayerId={save.playerId} />}
          <div className="mt-4 max-h-40 overflow-y-auto rounded-2xl bg-[#1a1a2e] p-4 font-mono text-xs text-green-300">
            {logs.map((log, i) => <div key={`${i}-${log.slice(0,8)}`}>{log}</div>)}
          </div>
        </div>
        <BeastPanel beasts={save.beasts} selectedId={save.selectedBeastId} permanentBonus={save.permanentBonus} onSelect={(uid) => updateSave({ ...save, selectedBeastId: uid })} />
      </div>
    </div>
  );
}

function FishingPanel({ save, scene, phase, lastCatch, onCast, onReel, onSceneChange }: {
  save: GameSave; scene: (typeof SCENES)[0]; phase: FishPhase; lastCatch: CatchResult | null;
  onCast: () => void; onReel: () => void; onSceneChange: (id: string) => void;
}) {
  const displayFish = phase === "caught" || phase === "reeling" ? lastCatch?.fish : null;
  const isDark = scene.id === "starry_sea" || scene.id === "cloud_palace";

  return (
    <div className="overflow-hidden rounded-[28px] shadow-lg ring-1 ring-black/[0.06]">
      <div className="flex gap-2 overflow-x-auto bg-white/90 p-3">
        {SCENES.map((s) => {
          const locked = save.rodLevel < s.unlockRodLevel;
          return (
            <button key={s.id} type="button" disabled={locked} onClick={() => onSceneChange(s.id)}
              className={["shrink-0 rounded-xl px-3 py-2 text-xs", save.currentScene === s.id ? "bg-teal-100 font-semibold ring-2 ring-teal-400" : locked ? "text-gray-400" : "bg-gray-50"].join(" ")}>
              {s.emoji} {s.name}{locked ? ` 🔒${s.unlockRodLevel}` : ""}
            </button>
          );
        })}
      </div>

      <div className={`p-4 ${isDark ? "bg-gradient-to-b from-indigo-950 to-purple-900" : "bg-gradient-to-b from-sky-50 to-blue-100"}`}>
        <p className={`mb-3 text-center text-xs ${isDark ? "text-indigo-200" : "text-gray-500"}`}>{scene.description}</p>
        <FishArt phase={phase} fish={displayFish} sceneEmoji={scene.emoji} />
      </div>

      <div className="flex flex-col items-center gap-3 bg-white px-4 py-6">
        {phase === "idle" || phase === "caught" ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            animate={{ boxShadow: ["0 0 0 0 rgba(20,184,166,0.4)", "0 0 0 14px rgba(20,184,166,0)", "0 0 0 0 rgba(20,184,166,0)"] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={onCast}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 py-5 text-xl font-bold tracking-wide text-white shadow-[0_12px_40px_rgba(20,184,166,0.45)]"
          >
            🎣 {FISH_PAGE.castButton}
          </motion.button>
        ) : phase === "bite" ? (
          <motion.button
            type="button"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 0.45 }}
            whileTap={{ scale: 0.94 }}
            onClick={onReel}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 py-5 text-xl font-bold text-white shadow-[0_12px_40px_rgba(239,68,68,0.45)]"
          >
            🔔 {FISH_PAGE.reelButton}
          </motion.button>
        ) : (
          <div className="py-4 text-sm text-[var(--mute)]">
            {phase === "casting" ? "抛竿中…" : phase === "reeling" ? "收竿中…" : "等待咬钩…"}
          </div>
        )}
      </div>
    </div>
  );
}

function CodexPanel({ codex, completedSets, dragonBalls }: { codex: Record<string, number>; completedSets: typeof CODEX_SETS; dragonBalls: number[] }) {
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">📖 图鉴</h2>
      {dragonBalls.length > 0 && <p className="mt-1 text-sm text-red-600">🔴 龙珠 {dragonBalls.length}/7</p>}
      <div className="mt-3 space-y-2">
        {CODEX_SETS.map((set) => {
          const done = completedSets.some((s) => s.id === set.id);
          const prog = set.fishIds.filter((id) => (codex[id] ?? 0) > 0).length;
          return (
            <div key={set.id} className={["rounded-xl p-3 text-sm ring-1", done ? "bg-teal-50 ring-teal-200" : "bg-gray-50"].join(" ")}>
              {set.name} — {done ? "✅ 已集齐" : `${prog}/${set.fishIds.length}`} · {set.bonusLabel}
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {FISH.filter((f) => f.category !== "equipment").map((fish) => {
          const c = codex[fish.id] ?? 0;
          return (
            <div key={fish.id} className={["rounded-xl p-2 text-center text-xs", c > 0 ? "bg-white ring-1" : "bg-gray-100 text-gray-400"].join(" ")}>
              <div className="text-xl">{c > 0 ? fish.ascii : "?"}</div>
              <div className="truncate">{c > 0 ? fish.name : "???"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShopPanel({ gold, rodLevel, upgradeCost, onUpgrade }: { gold: number; rodLevel: number; upgradeCost: number; onUpgrade: () => void }) {
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">🏪 商店</h2>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
        <div><div className="text-2xl">🎣</div><div className="font-semibold">鱼竿 Lv.{rodLevel} → {rodLevel + 1}</div></div>
        <button type="button" disabled={gold < upgradeCost} onClick={onUpgrade} className="rounded-xl bg-teal-600 px-4 py-2 text-sm text-white disabled:opacity-40">💰 {formatGold(upgradeCost)}</button>
      </div>
    </div>
  );
}

function BagPanel({ inventory, cards, onSell, onSellAll, onUseCard }: { inventory: GameSave["inventory"]; cards: Record<string, number>; onSell: (uid: string) => void; onSellAll: () => void; onUseCard: (id: string) => void }) {
  const cardEntries = Object.entries(cards).filter(([, n]) => n > 0);
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <div className="flex justify-between"><h2 className="text-lg font-semibold">🎒 背包</h2><button type="button" onClick={onSellAll} className="rounded-xl bg-amber-100 px-3 py-1 text-xs">{FISH_PAGE.sellAll}</button></div>
      {cardEntries.length > 0 && (
        <div className="mt-3 space-y-2">
          {cardEntries.map(([id, count]) => {
            const fish = getFishById(id);
            if (!fish) return null;
            return (
              <div key={id} className="flex justify-between rounded-xl bg-pink-50 px-3 py-2">
                <span>{fish.ascii} {fish.name} ×{count}</span>
                <button type="button" onClick={() => onUseCard(id)} className="rounded-lg bg-pink-500 px-3 py-1 text-xs text-white">使用</button>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
        {inventory.map((item) => {
          const fish = getFishById(item.fishId);
          if (!fish) return null;
          return (
            <div key={item.uid} className="flex justify-between rounded-xl bg-gray-50 px-3 py-2">
              <span>{fish.ascii} {fish.name}</span>
              <button type="button" onClick={() => onSell(item.uid)} className="rounded-lg bg-amber-500 px-3 py-1 text-xs text-white">出售</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TowerPanel({ towerFloor, selectedBeast, permanentBonus, towerResult, onChallenge }: { towerFloor: number; selectedBeast: GameSave["beasts"][0] | undefined; permanentBonus: GameSave["permanentBonus"]; towerResult: TowerBattleResult | null; onChallenge: () => void }) {
  const next = towerFloor + 1;
  const stats = selectedBeast ? getUnitStats(selectedBeast, permanentBonus) : null;
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">🏯 通天塔 · 第{next}层</h2>
      {stats && <p className="mt-2 text-sm">⚔{stats.atk} 🛡{stats.def} ❤{stats.hp}</p>}
      <button type="button" onClick={onChallenge} className="mt-4 w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white">⚔️ 挑战</button>
      {towerResult && <div className="mt-4 rounded-xl bg-[#1a1a2e] p-3 font-mono text-xs text-green-300">{towerResult.log.map((l, i) => <div key={i}>{l}</div>)}</div>}
    </div>
  );
}

function BeastPanel({ beasts, selectedId, permanentBonus, onSelect }: { beasts: GameSave["beasts"]; selectedId: string | null; permanentBonus: GameSave["permanentBonus"]; onSelect: (uid: string) => void }) {
  return (
    <div className="rounded-[28px] bg-white p-4 ring-1 ring-black/[0.06] lg:sticky lg:top-20">
      <h2 className="font-semibold">🐲 灵兽栏</h2>
      <p className="text-[10px] text-[var(--mute)]">永久加成 +{permanentBonus.atk ?? 0}攻 +{permanentBonus.def ?? 0}防 +{permanentBonus.hp ?? 0}血</p>
      <div className="mt-3 space-y-2">
        {beasts.map((b) => {
          const fish = getFishById(b.beastId);
          const stats = getUnitStats(b, permanentBonus);
          return (
            <button key={b.uid} type="button" onClick={() => onSelect(b.uid)} className={["w-full rounded-xl p-3 text-left", b.uid === selectedId ? "bg-teal-50 ring-2 ring-teal-400" : "bg-gray-50 ring-1"].join(" ")}>
              <div className="flex gap-2"><span className="text-2xl">{fish?.ascii}</span><div><div className="text-sm font-medium">{fish?.name}</div><div className="text-xs text-[var(--mute)]">Lv.{b.level} ⚔{stats.atk} 🛡{stats.def} ❤{stats.hp}</div></div></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
