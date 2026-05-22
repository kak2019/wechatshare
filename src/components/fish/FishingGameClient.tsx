"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { GlobalTicker } from "@/components/fish/GlobalTicker";
import { LeaderboardPanel } from "@/components/fish/LeaderboardPanel";
import { CODEX_SETS, FISH, FISH_PAGE, RARITY_LABELS, SCENES } from "@/content/fish";
import {
  broadcastCatch,
  fetchGlobalEvents,
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
  const reduced = useReducedMotion();
  const [save, setSave] = useState<GameSave | null>(null);
  const [tab, setTab] = useState<GameTab>("fish");
  const [phase, setPhase] = useState<FishPhase>("idle");
  const [logs, setLogs] = useState<string[]>(["欢迎来到灵渊钓奇！输入名字后可上排行榜。"]);
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [towerResult, setTowerResult] = useState<TowerBattleResult | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [globalEvents, setGlobalEvents] = useState<GlobalEvent[]>([]);
  const [weatherActive, setWeatherActive] = useState(false);
  const [weatherBuffBy, setWeatherBuffBy] = useState("");
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const biteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingEncounter = useRef<ReturnType<typeof maybeTriggerEncounter>>(null);

  useEffect(() => {
    setTimeout(() => setSave(loadSave()), 0);
  }, []);

  const refreshEvents = useCallback(async () => {
    const data = await fetchGlobalEvents();
    if (!data) return;
    setGlobalEvents(data.events);
    setWeatherActive(data.weatherActive);
    setWeatherBuffBy(data.weatherBuffBy);
  }, []);

  useEffect(() => {
    refreshEvents();
    const t = setInterval(refreshEvents, 20000);
    return () => clearInterval(t);
  }, [refreshEvents]);

  const updateSave = useCallback((next: GameSave) => {
    setSave(next);
    persistSave(next);
    if (next.playerName.trim()) {
      syncLeaderboard(next).catch(() => {});
    }
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [msg, ...prev].slice(0, 60));
  }, []);

  const clearTimers = useCallback(() => {
    if (waitTimer.current) clearTimeout(waitTimer.current);
    if (biteTimer.current) clearTimeout(biteTimer.current);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const cast = () => {
    if (!save || phase !== "idle") return;
    if (!save.playerName.trim()) {
      addLog("⚠️ 请先输入渔夫名字，才能上排行榜和全服广播！");
    }
    clearTimers();
    setPhase("casting");
    setLastCatch(null);

    const enc = maybeTriggerEncounter(save);
    pendingEncounter.current = enc;
    let working = save;
    if (enc) {
      working = applyEncounter(save, enc);
      updateSave(working);
      addLog(`${enc.ascii} 奇遇：${enc.name}！${enc.message}`);
    } else {
      addLog("🎣 鱼线划出优美的弧线…");
    }

    const castDelay = reduced ? 300 : 800;
    waitTimer.current = setTimeout(() => {
      setPhase("waiting");
      if (!enc) addLog("⏳ 浮漂轻轻晃动…");
      const waitMs = reduced ? 600 : 1500 + Math.random() * 2500;
      waitTimer.current = setTimeout(() => {
        setPhase("bite");
        addLog("❗ 咬钩了！快收竿！");
        biteTimer.current = setTimeout(() => {
          setPhase("idle");
          pendingEncounter.current = null;
          addLog("💨 鱼跑了…");
        }, reduced ? 3000 : 2000);
      }, waitMs);
    }, castDelay);
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
        const msg = `${next.playerName} 钓到了 ${fish.ascii}${fish.name}！`;
        broadcastCatch(next.playerName, msg, fish.id.startsWith("db_") ? "dragon" : "catch");
        refreshEvents();
      }

      setTimeout(() => setPhase("idle"), reduced ? 500 : 1800);
    }, reduced ? 200 : 600);
  };

  const handleUseCard = async (cardId: string) => {
    if (!save) return;
    const res = useCard(save, cardId);
    if (!res) {
      addLog("❌ 没有这张卡片");
      return;
    }
    updateSave(res.save);
    if (res.effect === "weather_broadcast") {
      if (!save.playerName.trim()) {
        addLog("⚠️ 需要名字才能全服广播天气不错！");
        return;
      }
      await useWeatherCard(save.playerName);
      addLog("☀️ 天气不错卡已使用！全服 30 分钟稀有度 +10%！");
      refreshEvents();
    } else {
      addLog(`🃏 ${res.effect}`);
    }
  };

  const handleSell = (uid: string) => {
    if (!save) return;
    const item = save.inventory.find((i) => i.uid === uid);
    const fish = item ? getFishById(item.fishId) : null;
    updateSave(sellFish(save, uid));
    if (fish) addLog(`💰 出售 ${fish.name}，+${fish.value} 金`);
  };

  const handleSellAll = () => {
    if (!save) return;
    const next = sellAllCommon(save);
    addLog(`💰 批量出售 +${next.gold - save.gold} 金`);
    updateSave(next);
  };

  const handleUpgrade = () => {
    if (!save) return;
    const cost = rodUpgradeCost(save.rodLevel);
    const next = upgradeRod(save);
    if (!next) {
      addLog(`❌ 需要 ${formatGold(cost)} 金`);
      return;
    }
    updateSave(next);
    addLog(`🔧 鱼竿 Lv.${next.rodLevel}！`);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--mute)]">{FISH_PAGE.eyebrow}</p>
        <h1 className="mt-2 font-hand-zh text-4xl font-bold md:text-5xl">
          <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">{FISH_PAGE.heading}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--mute)]">{FISH_PAGE.subtitle}</p>
      </div>

      <GlobalTicker events={globalEvents} weatherActive={weatherActive} weatherBuffBy={weatherBuffBy} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/[0.05]">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>👤 <input className="w-28 border-b border-dashed border-gray-300 bg-transparent outline-none focus:border-teal-400" value={save.playerName} onChange={(e) => updateSave({ ...save, playerName: e.target.value })} placeholder={FISH_PAGE.playerNamePlaceholder} /></span>
          <span className="font-semibold text-amber-600">💰 {formatGold(save.gold)}</span>
          <span className="text-[var(--mute)]">🎣 Lv.{save.rodLevel}</span>
          <span className="text-[var(--mute)]">🏯 {save.towerFloor}层</span>
          {save.dragonBalls.length > 0 && <span className="text-red-500">🔴 {save.dragonBalls.length}/7</span>}
        </div>
        <button type="button" onClick={() => setShowExport(!showExport)} className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-black/[0.08]">存档</button>
      </div>

      {showExport && (
        <div className="mb-4 rounded-2xl bg-amber-50/80 p-4 text-xs text-[var(--mute)] ring-1 ring-amber-200">
          <p>{FISH_PAGE.saveNote}</p>
          <p className="mt-1">{FISH_PAGE.multiplayerNote}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-black/[0.08]" onClick={() => { void navigator.clipboard.writeText(exportSave(save)); addLog("📋 已复制存档"); }}>导出</button>
            <button type="button" className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-black/[0.08]" onClick={() => { const raw = prompt("粘贴存档 JSON"); if (!raw) return; const imp = importSave(raw); if (imp) { updateSave(imp); addLog("✅ 导入成功"); } else addLog("❌ 格式错误"); }}>导入</button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={["rounded-full px-4 py-2 text-sm font-medium", tab === t.id ? "bg-teal-600 text-white shadow-md" : "bg-white text-[var(--mute)] ring-1 ring-black/[0.08]"].join(" ")}>{t.label}</button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {tab === "fish" && <FishingPanel save={save} scene={scene} phase={phase} lastCatch={lastCatch} onCast={cast} onReel={reel} onSceneChange={(id) => updateSave({ ...save, currentScene: id })} catchRate={getCatchRateDisplay(save, weatherActive)} />}
          {tab === "codex" && <CodexPanel codex={save.codex} completedSets={completedSets} dragonBalls={save.dragonBalls} />}
          {tab === "shop" && <ShopPanel gold={save.gold} rodLevel={save.rodLevel} upgradeCost={rodUpgradeCost(save.rodLevel)} onUpgrade={handleUpgrade} />}
          {tab === "bag" && <BagPanel inventory={save.inventory} cards={save.cards} onSell={handleSell} onSellAll={handleSellAll} onUseCard={handleUseCard} />}
          {tab === "tower" && <TowerPanel towerFloor={save.towerFloor} selectedBeast={selectedBeast} permanentBonus={save.permanentBonus} towerResult={towerResult} onChallenge={handleTower} />}
          {tab === "rank" && <LeaderboardPanel currentPlayerId={save.playerId} />}
          <div className="mt-4 max-h-44 overflow-y-auto rounded-2xl bg-[#1a1a2e] p-4 font-mono text-xs text-green-300">
            {logs.map((log, i) => <div key={`${i}-${log.slice(0,8)}`} className={i === 0 ? "text-green-200" : "text-green-400/70"}>{log}</div>)}
          </div>
        </div>
        <BeastPanel beasts={save.beasts} selectedId={save.selectedBeastId} permanentBonus={save.permanentBonus} onSelect={(uid) => updateSave({ ...save, selectedBeastId: uid })} />
      </div>
    </div>
  );
}

function FishingPanel({ save, scene, phase, lastCatch, onCast, onReel, onSceneChange, catchRate }: { save: GameSave; scene: (typeof SCENES)[0]; phase: FishPhase; lastCatch: CatchResult | null; onCast: () => void; onReel: () => void; onSceneChange: (id: string) => void; catchRate: string }) {
  const isDark = scene.id === "starry_sea" || scene.id === "cloud_palace";
  return (
    <div className="overflow-hidden rounded-[28px] shadow-lg ring-1 ring-black/[0.06]">
      <div className="flex gap-2 overflow-x-auto bg-white/90 p-3">
        {SCENES.map((s) => {
          const locked = save.rodLevel < s.unlockRodLevel;
          return (
            <button key={s.id} type="button" disabled={locked} onClick={() => onSceneChange(s.id)} className={["shrink-0 rounded-xl px-3 py-2 text-xs", save.currentScene === s.id ? "bg-teal-100 font-semibold ring-2 ring-teal-400" : locked ? "bg-gray-100 text-gray-400" : "bg-gray-50 hover:bg-gray-100"].join(" ")}>
              {s.emoji} {s.name}{locked ? ` 🔒${s.unlockRodLevel}` : ""}
            </button>
          );
        })}
      </div>
      <div className={`bg-gradient-to-b ${scene.bgClass} p-6 ${isDark ? "text-white" : "text-gray-800"}`}>
        <p className="text-center text-xs opacity-70">{scene.description}</p>
        <pre className="my-4 text-center font-mono text-[10px] md:text-xs opacity-70">{`    ${scene.emoji} ${scene.name} ${scene.emoji}\n         ┌───┐\n         │ ${phase === "bite" ? "!!" : "～"} │\n    ${scene.waterArt}\n    ${lastCatch && phase === "caught" ? "  " + lastCatch.fish.ascii + " " + lastCatch.fish.name : "  ～ ～ ～"}`}</pre>
        <AnimatePresence>
          {lastCatch && phase === "caught" && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto max-w-sm rounded-2xl bg-white/90 p-4 text-center shadow-lg">
              <div className="text-4xl">{lastCatch.fish.ascii}</div>
              <div className="font-semibold">{lastCatch.fish.name}</div>
              <div className={`text-xs ${RARITY_LABELS[lastCatch.fish.rarity]?.color ?? ""}`}>{RARITY_LABELS[lastCatch.fish.rarity]?.label}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-2 text-center text-[10px] opacity-60">{catchRate}</p>
      </div>
      <div className="flex justify-center gap-3 bg-white p-4">
        {phase === "idle" || phase === "caught" ? (
          <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={onCast} className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3 font-semibold text-white">{FISH_PAGE.castButton}</motion.button>
        ) : phase === "bite" ? (
          <motion.button type="button" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} whileTap={{ scale: 0.95 }} onClick={onReel} className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 font-semibold text-white">{FISH_PAGE.reelButton}</motion.button>
        ) : (
          <button type="button" disabled className="rounded-2xl bg-gray-200 px-8 py-3 text-gray-500">{FISH_PAGE.waitingButton}</button>
        )}
      </div>
    </div>
  );
}

function CodexPanel({ codex, completedSets, dragonBalls }: { codex: Record<string, number>; completedSets: typeof CODEX_SETS; dragonBalls: number[] }) {
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">📖 图鉴</h2>
      {dragonBalls.length > 0 && <p className="mt-1 text-sm text-red-600">🔴 龙珠收集：{dragonBalls.map((n) => n + "星").join(" ")} ({dragonBalls.length}/7)</p>}
      <div className="mt-3 space-y-2">
        {CODEX_SETS.map((set) => {
          const done = completedSets.some((s) => s.id === set.id);
          const prog = set.fishIds.filter((id) => (codex[id] ?? 0) > 0).length;
          return (
            <div key={set.id} className={["rounded-xl p-3 ring-1", done ? "bg-teal-50 ring-teal-200" : "bg-gray-50 ring-gray-200"].join(" ")}>
              <div className="flex justify-between text-sm"><span className="font-medium">{set.name}</span><span className="text-xs">{done ? "✅" : `${prog}/${set.fishIds.length}`} · {set.bonusLabel}</span></div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {FISH.filter((f) => !["equipment"].includes(f.category)).slice(0, 40).map((fish) => {
          const c = codex[fish.id] ?? 0;
          return (
            <div key={fish.id} className={["rounded-xl p-2 text-center text-xs", c > 0 ? "bg-white ring-1" : "bg-gray-100 text-gray-400"].join(" ")}>
              <div className="text-lg">{c > 0 ? fish.ascii : "?"}</div>
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
      <div className="mt-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200 flex justify-between items-center">
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
        <div className="mt-4">
          <h3 className="text-sm font-medium">🃏 卡片</h3>
          <div className="mt-2 space-y-2">
            {cardEntries.map(([id, count]) => {
              const fish = getFishById(id);
              if (!fish) return null;
              return (
                <div key={id} className="flex items-center justify-between rounded-xl bg-pink-50 px-3 py-2">
                  <span>{fish.ascii} {fish.name} ×{count}</span>
                  <button type="button" onClick={() => onUseCard(id)} className="rounded-lg bg-pink-500 px-3 py-1 text-xs text-white">使用</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
        {inventory.map((item) => {
          const fish = getFishById(item.fishId);
          if (!fish) return null;
          return (
            <div key={item.uid} className="flex justify-between rounded-xl bg-gray-50 px-3 py-2">
              <span>{fish.ascii} {fish.name} · {formatGold(fish.value)}金</span>
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
      <h2 className="text-lg font-semibold">🏯 通天塔 · 第{next}层{next % 10 === 0 ? " BOSS" : ""}</h2>
      {selectedBeast && stats && <p className="mt-2 text-sm">出战：{getFishById(selectedBeast.beastId)?.ascii} Lv.{selectedBeast.level} ⚔{stats.atk} 🛡{stats.def} ❤{stats.hp}</p>}
      <button type="button" onClick={onChallenge} className="mt-4 w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white">⚔️ 挑战</button>
      {towerResult && <div className="mt-4 rounded-xl bg-[#1a1a2e] p-3 font-mono text-xs text-green-300">{towerResult.log.map((l, i) => <div key={i}>{l}</div>)}</div>}
    </div>
  );
}

function BeastPanel({ beasts, selectedId, permanentBonus, onSelect }: { beasts: GameSave["beasts"]; selectedId: string | null; permanentBonus: GameSave["permanentBonus"]; onSelect: (uid: string) => void }) {
  const slots = { head: "头", body: "身", weapon: "武", accessory: "饰" } as const;
  return (
    <div className="rounded-[28px] bg-white p-4 ring-1 ring-black/[0.06] lg:sticky lg:top-20">
      <h2 className="font-semibold">🐲 灵兽栏</h2>
      <p className="text-[10px] text-[var(--mute)]">宝物永久加成：+{permanentBonus.atk ?? 0}攻 +{permanentBonus.def ?? 0}防 +{permanentBonus.hp ?? 0}血</p>
      {beasts.length === 0 ? <p className="mt-4 text-center text-xs text-[var(--mute)]">钓神兽/传奇来激活</p> : (
        <div className="mt-3 space-y-2">
          {beasts.map((b) => {
            const fish = getFishById(b.beastId);
            const stats = getUnitStats(b, permanentBonus);
            const expNeed = b.level * 50 + (b.level - 1) ** 2 * 20;
            return (
              <button key={b.uid} type="button" onClick={() => onSelect(b.uid)} className={["w-full rounded-xl p-3 text-left", b.uid === selectedId ? "bg-teal-50 ring-2 ring-teal-400" : "bg-gray-50 ring-1"].join(" ")}>
                <div className="flex gap-2"><span className="text-2xl">{fish?.ascii}</span><div><div className="text-sm font-medium">{fish?.name}</div><div className="text-xs text-[var(--mute)]">Lv.{b.level} ⚔{stats.atk} 🛡{stats.def} ❤{stats.hp}</div></div></div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-200"><div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, (b.exp / expNeed) * 100)}%` }} /></div>
                <div className="mt-1 flex gap-1">{(["head", "body", "weapon", "accessory"] as const).map((s) => <span key={s} className="text-[10px]">{slots[s]}:{b.equipment[s] ? getEquipmentById(b.equipment[s]!)?.ascii : "—"}</span>)}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
