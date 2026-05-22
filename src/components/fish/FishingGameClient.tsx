"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CODEX_SETS,
  FISH,
  FISH_PAGE,
  RARITY_LABELS,
  SCENES,
} from "@/content/fish";
import {
  exportSave,
  getCatchRateDisplay,
  getCompletedSets,
  getFishById,
  getEquipmentById,
  getUnitStats,
  importSave,
  processCatch,
  rollCatch,
  rodUpgradeCost,
  runTowerBattle,
  sellAllCommon,
  sellFish,
  upgradeRod,
} from "@/lib/fish/engine";
import { loadSave, persistSave } from "@/lib/fish/storage";
import type { CatchResult, GameSave, GameTab, TowerBattleResult } from "@/lib/fish/types";

type FishPhase = "idle" | "casting" | "waiting" | "bite" | "reeling" | "caught";

const TABS: { id: GameTab; label: string }[] = [
  { id: "fish", label: FISH_PAGE.tabs.fish },
  { id: "codex", label: FISH_PAGE.tabs.codex },
  { id: "shop", label: FISH_PAGE.tabs.shop },
  { id: "bag", label: FISH_PAGE.tabs.bag },
  { id: "tower", label: FISH_PAGE.tabs.tower },
];

function formatGold(n: number) {
  return n.toLocaleString("zh-CN");
}

export function FishingGameClient() {
  const reduced = useReducedMotion();
  const [save, setSave] = useState<GameSave | null>(null);
  const [tab, setTab] = useState<GameTab>("fish");
  const [phase, setPhase] = useState<FishPhase>("idle");
  const [logs, setLogs] = useState<string[]>(["欢迎来到灵渊钓奇！抛竿开始你的传说。"]);
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [towerResult, setTowerResult] = useState<TowerBattleResult | null>(null);
  const [showExport, setShowExport] = useState(false);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const biteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => setSave(loadSave()), 0);
  }, []);

  const updateSave = useCallback((next: GameSave) => {
    setSave(next);
    persistSave(next);
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [msg, ...prev].slice(0, 50));
  }, []);

  const clearTimers = useCallback(() => {
    if (waitTimer.current) clearTimeout(waitTimer.current);
    if (biteTimer.current) clearTimeout(biteTimer.current);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const cast = () => {
    if (!save || phase !== "idle") return;
    clearTimers();
    setPhase("casting");
    setLastCatch(null);
    addLog("🎣 鱼线划出优美的弧线…");

    const castDelay = reduced ? 300 : 800;
    waitTimer.current = setTimeout(() => {
      setPhase("waiting");
      addLog("⏳ 浮漂轻轻晃动，耐心等待…");

      const waitMs = reduced ? 600 : 1500 + Math.random() * 2500;
      waitTimer.current = setTimeout(() => {
        setPhase("bite");
        addLog("❗ 咬钩了！快收竿！");

        const biteWindow = reduced ? 3000 : 2000;
        biteTimer.current = setTimeout(() => {
          setPhase("idle");
          addLog("💨 鱼跑了…反应太慢啦！");
        }, biteWindow);
      }, waitMs);
    }, castDelay);
  };

  const reel = () => {
    if (!save || phase !== "bite") return;
    clearTimers();
    setPhase("reeling");

    setTimeout(() => {
      const fish = rollCatch(save);
      const { save: next, result } = processCatch(save, fish);
      updateSave(next);
      setLastCatch(result);
      addLog(result.message);
      setPhase("caught");

      setTimeout(() => setPhase("idle"), reduced ? 500 : 1800);
    }, reduced ? 200 : 600);
  };

  const handleSell = (uid: string) => {
    if (!save) return;
    const item = save.inventory.find((i) => i.uid === uid);
    const fish = item ? getFishById(item.fishId) : null;
    updateSave(sellFish(save, uid));
    if (fish) addLog(`💰 出售 ${fish.name}，获得 ${fish.value} 金`);
  };

  const handleSellAll = () => {
    if (!save) return;
    const before = save.gold;
    const next = sellAllCommon(save);
    updateSave(next);
    addLog(`💰 批量出售普通鱼，获得 ${next.gold - before} 金`);
  };

  const handleUpgrade = () => {
    if (!save) return;
    const cost = rodUpgradeCost(save.rodLevel);
    const next = upgradeRod(save);
    if (!next) {
      addLog(`❌ 金币不足！升级需要 ${formatGold(cost)} 金`);
      return;
    }
    updateSave(next);
    addLog(`🔧 鱼竿升级至 Lv.${next.rodLevel}！稀有鱼概率提升！`);
  };

  const handleTower = () => {
    if (!save || !save.selectedBeastId) {
      addLog("❌ 请先选择一只 Lv.3+ 的灵兽！");
      return;
    }
    const beast = save.beasts.find((b) => b.uid === save.selectedBeastId);
    if (!beast || beast.level < 3) {
      addLog("❌ 灵兽至少 Lv.3 才能闯通天塔！多钓同类来升级。");
      return;
    }
    const result = runTowerBattle(save, save.selectedBeastId);
    if (!result) return;
    updateSave(result.save);
    setTowerResult(result.result);
    result.result.log.forEach(addLog);
  };

  if (!save) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--mute)]">
        加载存档中…
      </div>
    );
  }

  const scene = SCENES.find((s) => s.id === save.currentScene) ?? SCENES[0];
  const selectedBeast = save.beasts.find((b) => b.uid === save.selectedBeastId);
  const upgradeCost = rodUpgradeCost(save.rodLevel);
  const completedSets = getCompletedSets(save.codex);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--mute)]">{FISH_PAGE.eyebrow}</p>
        <h1 className="mt-2 font-hand-zh text-4xl font-bold md:text-5xl">
          <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            {FISH_PAGE.heading}
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--mute)]">{FISH_PAGE.subtitle}</p>
      </div>

      {/* Status bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/[0.05]">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>
            👤{" "}
            <input
              className="w-24 border-b border-dashed border-gray-300 bg-transparent outline-none focus:border-teal-400"
              value={save.playerName}
              onChange={(e) => updateSave({ ...save, playerName: e.target.value })}
              placeholder={FISH_PAGE.playerNamePlaceholder}
            />
          </span>
          <span className="font-semibold text-amber-600">💰 {formatGold(save.gold)}</span>
          <span className="text-[var(--mute)]">🎣 Lv.{save.rodLevel}</span>
          <span className="text-[var(--mute)]">📦 {save.inventory.length}</span>
          <span className="text-[var(--mute)]">🏯 塔 {save.towerFloor} 层</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowExport(!showExport)}
            className="rounded-xl px-3 py-1.5 text-xs text-[var(--mute)] ring-1 ring-black/[0.08] hover:bg-gray-50"
          >
            存档
          </button>
        </div>
      </div>

      {showExport && (
        <div className="mb-4 rounded-2xl bg-amber-50/80 p-4 text-xs text-[var(--mute)] ring-1 ring-amber-200">
          <p className="mb-2">{FISH_PAGE.saveNote}</p>
          <p className="mb-3">{FISH_PAGE.multiplayerNote}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-black/[0.08] hover:bg-gray-50"
              onClick={() => {
                void navigator.clipboard.writeText(exportSave(save));
                addLog("📋 存档已复制到剪贴板");
              }}
            >
              导出存档
            </button>
            <button
              type="button"
              className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-black/[0.08] hover:bg-gray-50"
              onClick={() => {
                const raw = prompt("粘贴存档 JSON：");
                if (!raw) return;
                const imported = importSave(raw);
                if (imported) {
                  updateSave(imported);
                  addLog("✅ 存档导入成功！");
                } else {
                  addLog("❌ 存档格式无效");
                }
              }}
            >
              导入存档
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition-all",
              tab === t.id
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-[var(--mute)] ring-1 ring-black/[0.08] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Main panel */}
        <div className="min-w-0">
          {tab === "fish" && (
            <FishingPanel
              save={save}
              scene={scene}
              phase={phase}
              lastCatch={lastCatch}
              onCast={cast}
              onReel={reel}
              onSceneChange={(id) => updateSave({ ...save, currentScene: id })}
              catchRate={getCatchRateDisplay(save)}
            />
          )}
          {tab === "codex" && <CodexPanel codex={save.codex} completedSets={completedSets} />}
          {tab === "shop" && (
            <ShopPanel
              gold={save.gold}
              rodLevel={save.rodLevel}
              upgradeCost={upgradeCost}
              onUpgrade={handleUpgrade}
            />
          )}
          {tab === "bag" && (
            <BagPanel inventory={save.inventory} onSell={handleSell} onSellAll={handleSellAll} />
          )}
          {tab === "tower" && (
            <TowerPanel
              towerFloor={save.towerFloor}
              selectedBeast={selectedBeast}
              towerResult={towerResult}
              onChallenge={handleTower}
            />
          )}

          {/* Log */}
          <div className="mt-4 max-h-40 overflow-y-auto rounded-2xl bg-[#1a1a2e] p-4 font-mono text-xs leading-relaxed text-green-300">
            {logs.map((log, i) => (
              <div key={`${i}-${log.slice(0, 12)}`} className={i === 0 ? "text-green-200" : "text-green-400/70"}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Beast sidebar */}
        <BeastPanel
          beasts={save.beasts}
          selectedId={save.selectedBeastId}
          onSelect={(uid) => updateSave({ ...save, selectedBeastId: uid })}
        />
      </div>
    </div>
  );
}

function FishingPanel({
  save,
  scene,
  phase,
  lastCatch,
  onCast,
  onReel,
  onSceneChange,
  catchRate,
}: {
  save: GameSave;
  scene: (typeof SCENES)[0];
  phase: FishPhase;
  lastCatch: CatchResult | null;
  onCast: () => void;
  onReel: () => void;
  onSceneChange: (id: string) => void;
  catchRate: string;
}) {
  const isDark = scene.id === "starry_sea" || scene.id === "cloud_palace";

  return (
    <div className="overflow-hidden rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06]">
      {/* Scene selector */}
      <div className="flex gap-2 overflow-x-auto bg-white/90 p-3">
        {SCENES.map((s) => {
          const locked = save.rodLevel < s.unlockRodLevel;
          return (
            <button
              key={s.id}
              type="button"
              disabled={locked}
              onClick={() => onSceneChange(s.id)}
              className={[
                "shrink-0 rounded-xl px-3 py-2 text-xs transition-all",
                save.currentScene === s.id
                  ? "bg-teal-100 font-semibold text-teal-800 ring-2 ring-teal-400"
                  : locked
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-gray-50 text-[var(--mute)] hover:bg-gray-100",
              ].join(" ")}
            >
              {s.emoji} {s.name}
              {locked ? ` 🔒Lv${s.unlockRodLevel}` : ""}
            </button>
          );
        })}
      </div>

      {/* Water scene ASCII art */}
      <div className={`relative bg-gradient-to-b ${scene.bgClass} p-6 ${isDark ? "text-white" : "text-gray-800"}`}>
        <p className="text-center text-xs opacity-70">{scene.description}</p>

        <pre className="my-4 select-none text-center font-mono text-[10px] leading-tight opacity-60 md:text-xs">
{`        ${scene.emoji}  ${scene.name}  ${scene.emoji}
    ☁️                    ☁️
         ┌───┐
         │ ${phase === "waiting" ? "..." : phase === "bite" ? "!!" : "～"} │
         └─┬─┘
           │ ${phase === "casting" ? "／" : "│"}
    ${scene.waterArt}
    ${phase === "bite" ? "     🐟💥" : phase === "caught" && lastCatch ? `     ${lastCatch.fish.ascii}` : "     ～ ～ ～"}`}
        </pre>

        <AnimatePresence>
          {lastCatch && phase === "caught" && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-sm rounded-2xl bg-white/90 p-4 text-center shadow-lg backdrop-blur"
            >
              <div className="text-4xl">{lastCatch.fish.ascii}</div>
              <div className="mt-1 font-semibold">{lastCatch.fish.name}</div>
              <div className={`text-xs ${RARITY_LABELS[lastCatch.fish.rarity]?.color ?? ""}`}>
                {RARITY_LABELS[lastCatch.fish.rarity]?.label} · {formatGold(lastCatch.fish.value)} 金
              </div>
              {lastCatch.isNew && <div className="mt-1 text-xs text-teal-600">🆕 新图鉴！</div>}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-3 text-center text-[10px] opacity-60">{catchRate}</p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3 bg-white p-4">
        {phase === "idle" || phase === "caught" ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onCast}
            className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3 font-semibold text-white shadow-lg hover:shadow-xl"
          >
            {FISH_PAGE.castButton}
          </motion.button>
        ) : phase === "bite" ? (
          <motion.button
            type="button"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReel}
            className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 font-semibold text-white shadow-lg"
          >
            {FISH_PAGE.reelButton}
          </motion.button>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-wait rounded-2xl bg-gray-200 px-8 py-3 font-semibold text-gray-500"
          >
            {phase === "waiting" ? FISH_PAGE.waitingButton : "…"}
          </button>
        )}
      </div>
    </div>
  );
}

function CodexPanel({
  codex,
  completedSets,
}: {
  codex: Record<string, number>;
  completedSets: typeof CODEX_SETS;
}) {
  const caught = Object.keys(codex).length;
  const total = FISH.filter((f) => f.category !== "equipment").length;

  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">📖 图鉴 {caught}/{total}</h2>
      <p className="mt-1 text-xs text-[var(--mute)]">集齐套装可提升珍稀鱼种出现概率</p>

      <div className="mt-4 space-y-3">
        {CODEX_SETS.map((set) => {
          const done = completedSets.some((s) => s.id === set.id);
          const progress = set.fishIds.filter((id) => (codex[id] ?? 0) > 0).length;
          return (
            <div
              key={set.id}
              className={[
                "rounded-xl p-3 ring-1",
                done ? "bg-teal-50 ring-teal-200" : "bg-gray-50 ring-gray-200",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{set.name}</span>
                <span className={`text-xs ${done ? "text-teal-600 font-semibold" : "text-[var(--mute)]"}`}>
                  {done ? "✅ 已集齐" : `${progress}/${set.fishIds.length}`} · {set.bonusLabel}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {set.fishIds.map((id) => {
                  const fish = getFishById(id);
                  const count = codex[id] ?? 0;
                  return (
                    <span
                      key={id}
                      className={[
                        "rounded-lg px-2 py-0.5 text-xs",
                        count > 0 ? "bg-white ring-1 ring-teal-200" : "bg-gray-200/60 text-gray-400",
                      ].join(" ")}
                      title={fish?.name}
                    >
                      {count > 0 ? fish?.ascii : "？"} {fish?.name?.slice(0, 2)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {FISH.filter((f) => f.category !== "equipment").map((fish) => {
          const count = codex[fish.id] ?? 0;
          return (
            <div
              key={fish.id}
              className={[
                "rounded-xl p-2 text-center text-xs",
                count > 0 ? "bg-white ring-1 ring-black/[0.06]" : "bg-gray-100 text-gray-400",
              ].join(" ")}
            >
              <div className="text-lg">{count > 0 ? fish.ascii : "❓"}</div>
              <div className="truncate">{count > 0 ? fish.name : "???"}</div>
              {count > 0 && <div className="text-[10px] text-[var(--mute)]">×{count}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShopPanel({
  gold,
  rodLevel,
  upgradeCost,
  onUpgrade,
}: {
  gold: number;
  rodLevel: number;
  upgradeCost: number;
  onUpgrade: () => void;
}) {
  const canAfford = gold >= upgradeCost;
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">🏪 商店</h2>
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 ring-1 ring-amber-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl">🎣</div>
            <div className="mt-1 font-semibold">精铁鱼竿 Lv.{rodLevel} → Lv.{rodLevel + 1}</div>
            <div className="mt-1 text-xs text-[var(--mute)]">提升稀有/史诗/传奇/神兽出现概率，解锁新场景</div>
          </div>
          <button
            type="button"
            disabled={!canAfford}
            onClick={onUpgrade}
            className={[
              "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold",
              canAfford
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            ].join(" ")}
          >
            💰 {formatGold(upgradeCost)}
          </button>
        </div>
        <pre className="mt-4 font-mono text-[10px] text-[var(--mute)]">{`
  Lv.1  ════○────  基础
  Lv.3  ════●────  解锁竹韵塘
  Lv.5  ════●════  解锁星空海
  Lv.7  ════●════●  解锁火山温泉
  Lv.10 ════●════●══  解锁云顶仙池
        `}</pre>
      </div>
    </div>
  );
}

function BagPanel({
  inventory,
  onSell,
  onSellAll,
}: {
  inventory: GameSave["inventory"];
  onSell: (uid: string) => void;
  onSellAll: () => void;
}) {
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">🎒 背包 ({inventory.length})</h2>
        <button
          type="button"
          onClick={onSellAll}
          className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200"
        >
          {FISH_PAGE.sellAll}
        </button>
      </div>
      {inventory.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--mute)]">背包空空如也，去钓几条鱼吧！</p>
      ) : (
        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {inventory.map((item) => {
            const fish = getFishById(item.fishId);
            if (!fish) return null;
            return (
              <div
                key={item.uid}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-black/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{fish.ascii}</span>
                  <div>
                    <div className="text-sm font-medium">{fish.name}</div>
                    <div className={`text-xs ${RARITY_LABELS[fish.rarity]?.color ?? ""}`}>
                      {RARITY_LABELS[fish.rarity]?.label} · {formatGold(fish.value)} 金
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSell(item.uid)}
                  className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600"
                >
                  出售
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TowerPanel({
  towerFloor,
  selectedBeast,
  towerResult,
  onChallenge,
}: {
  towerFloor: number;
  selectedBeast: GameSave["beasts"][0] | undefined;
  towerResult: TowerBattleResult | null;
  onChallenge: () => void;
}) {
  const nextFloor = towerFloor + 1;
  const isBoss = nextFloor % 10 === 0;

  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">🏯 通天塔</h2>
      <p className="mt-1 text-xs text-[var(--mute)]">灵兽 Lv.3 以上可挑战。每 10 层出现 BOSS。</p>

      <pre className="my-4 text-center font-mono text-xs leading-relaxed text-[var(--mute)]">{`
        ┌─────────┐
        │ 第 ${String(nextFloor).padStart(2, " ")} 层 ${isBoss ? "👹" : "👻"} │
        │ ${"━".repeat(9)} │
        │    🏯    │
        │   ╱ │ ╲   │
        │  ╱  │  ╲  │
        └─────────┘
      已通关：${towerFloor} 层`}</pre>

      {selectedBeast ? (
        <div className="rounded-xl bg-indigo-50 p-3 text-sm">
          出战：{getFishById(selectedBeast.beastId)?.ascii}{" "}
          {getFishById(selectedBeast.beastId)?.name ?? selectedBeast.beastId} Lv.{selectedBeast.level}
          {selectedBeast.level < 3 && (
            <span className="ml-2 text-red-500">（需要 Lv.3）</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-red-500">请先在右侧选择灵兽</p>
      )}

      <button
        type="button"
        onClick={onChallenge}
        disabled={!selectedBeast || selectedBeast.level < 3}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        ⚔️ 挑战第 {nextFloor} 层{isBoss ? " BOSS" : ""}
      </button>

      {towerResult && (
        <div className="mt-4 rounded-xl bg-[#1a1a2e] p-3 font-mono text-xs text-green-300">
          {towerResult.log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function BeastPanel({
  beasts,
  selectedId,
  onSelect,
}: {
  beasts: GameSave["beasts"];
  selectedId: string | null;
  onSelect: (uid: string) => void;
}) {
  const SLOT_LABELS = { head: "头", body: "身", weapon: "武", accessory: "饰" };

  return (
    <div className="rounded-[28px] bg-white p-4 ring-1 ring-black/[0.06] lg:sticky lg:top-20 lg:self-start">
      <h2 className="text-base font-semibold">🐲 灵兽栏</h2>
      <p className="mt-1 text-[10px] text-[var(--mute)]">钓到同类可升级 · 装备自动穿戴 · Lv.3 可闯塔</p>

      {beasts.length === 0 ? (
        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center text-xs text-[var(--mute)]">
          <pre className="font-mono">{`
   ？ ？ ？
  尚无灵兽
  钓神兽或传奇
  来激活此栏
          `}</pre>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {beasts.map((beast) => {
            const fish = getFishById(beast.beastId);
            const stats = getUnitStats(beast);
            const selected = beast.uid === selectedId;
            const expNeed = beast.level * 50 + (beast.level - 1) * (beast.level - 1) * 20;

            return (
              <button
                key={beast.uid}
                type="button"
                onClick={() => onSelect(beast.uid)}
                className={[
                  "w-full rounded-xl p-3 text-left transition-all",
                  selected
                    ? "bg-teal-50 ring-2 ring-teal-400"
                    : "bg-gray-50 ring-1 ring-black/[0.04] hover:bg-gray-100",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{fish?.ascii ?? "❓"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{fish?.name ?? beast.beastId}</div>
                    <div className="text-xs text-[var(--mute)]">
                      Lv.{beast.level} · ⚔{stats.atk} 🛡{stats.def} ❤{stats.hp}
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${Math.min(100, (beast.exp / expNeed) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  {(["head", "body", "weapon", "accessory"] as const).map((slot) => {
                    const eqId = beast.equipment[slot];
                    const eq = eqId ? getEquipmentById(eqId) : null;
                    return (
                      <span
                        key={slot}
                        className="rounded-md bg-white px-1.5 py-0.5 text-[10px] ring-1 ring-black/[0.06]"
                        title={eq?.name ?? "空"}
                      >
                        {SLOT_LABELS[slot]}:{eq ? eq.ascii : "—"}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
