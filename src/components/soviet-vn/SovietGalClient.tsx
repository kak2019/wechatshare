"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ENDINGS,
  PERSONALITIES,
  PROTAGONIST,
  SITE,
} from "@/content/soviet-vn/meta";
import { GAL_NODES } from "@/content/soviet-vn/script";
import {
  getCurrentTrack,
  playBgm,
  setMuted,
  unlockAudio,
} from "@/lib/soviet-vn/audio";
import {
  advanceStep,
  createRuntimeFromSave,
  pickChoice,
  recordEnding,
  repairRuntime,
  runtimeToProgress,
  startGame,
  type StepResult,
} from "@/lib/soviet-vn/engine";
import {
  averageStats,
  canUnlockDream,
  computePersonality,
} from "@/lib/soviet-vn/scoring";
import { loadSave, persistSave } from "@/lib/soviet-vn/storage";
import type { ChoiceOption, GameRuntime, SovietSave } from "@/lib/soviet-vn/types";

import { ChoicePanel } from "./ChoicePanel";
import { DialogueBox } from "./DialogueBox";
import { EndingGallery } from "./EndingGallery";
import { EndingScreen } from "./EndingScreen";
import { PersonalityResult } from "./PersonalityResult";
import { StageBackground, SCENE_LABELS } from "./StageBackground";

function getChoiceStep(runtime: GameRuntime): ChoiceOption[] | null {
  if (!runtime.awaitingChoice) return null;
  const node = GAL_NODES[runtime.nodeId];
  if (!node) return null;
  for (let i = runtime.stepIndex - 1; i >= 0; i--) {
    const step = node.steps[i];
    if (step?.type === "choice") return step.options;
  }
  return null;
}

function runUntilLine(runtime: GameRuntime): {
  runtime: GameRuntime;
  endingId: string | null;
} {
  let state = repairRuntime(runtime, GAL_NODES);
  let safety = 0;
  while (safety++ < 64) {
    const result: StepResult = advanceStep(state, GAL_NODES);
    state = result.runtime;
    if (result.reachedEnding && result.endingId) {
      return { runtime: state, endingId: result.endingId };
    }
    if (result.needsChoice || state.currentLine) {
      return { runtime: state, endingId: null };
    }
    if (state.stepIndex >= (GAL_NODES[state.nodeId]?.steps.length ?? 0)) {
      const repaired = repairRuntime(state, GAL_NODES);
      if (repaired.awaitingChoice && !state.awaitingChoice) {
        state = repaired;
        continue;
      }
      break;
    }
  }
  return { runtime: state, endingId: null };
}

export function SovietGalClient() {
  const [save, setSave] = useState<SovietSave>(() => loadSave());
  const [runtime, setRuntime] = useState<GameRuntime>(() =>
    createRuntimeFromSave(loadSave(), "prologue"),
  );
  const [endingId, setEndingId] = useState<string | null>(null);

  const finalizeEnding = useCallback((id: string, rt: GameRuntime) => {
    setEndingId(id);
    setRuntime(rt);
    setSave((prev) => {
      const next = recordEnding(prev, id, rt.stats, rt.choiceLog);
      if (id === "ending_dream") next.seenDream = true;
      persistSave(next);
      return next;
    });
  }, []);

  const dreamUnlocked = useMemo(
    () => canUnlockDream(save.unlockedEndings, save.runHistory),
    [save],
  );

  const personality = useMemo(
    () =>
      computePersonality(
        averageStats(save.runHistory),
        PERSONALITIES,
      ),
    [save.runHistory],
  );

  const choiceOptions = useMemo(() => getChoiceStep(runtime), [runtime]);

  useEffect(() => {
    if (runtime.bgm !== getCurrentTrack()) {
      void playBgm(runtime.bgm);
    }
  }, [runtime.bgm]);

  useEffect(() => {
    setMuted(save.muted);
  }, [save.muted]);

  // 修复旧存档或异常中断导致的「空白卡住」
  useEffect(() => {
    if (runtime.phase !== "playing" || endingId) return;
    if (runtime.currentLine || runtime.awaitingChoice) return;

    const { runtime: after, endingId: end } = runUntilLine(runtime);
    if (!after.currentLine && !after.awaitingChoice && !end) return;

    setRuntime(after);
    setSave((prev) => {
      const merged: SovietSave = {
        ...prev,
        inProgress: runtimeToProgress(after),
      };
      persistSave(merged);
      return merged;
    });
    if (end) finalizeEnding(end, after);
    // 仅挂载时尝试恢复一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 若已触发结局但 endingId 未写入（旧 bug 遗留存档），自动补全
  useEffect(() => {
    if (runtime.phase === "ending" && runtime.pendingEndingId && !endingId) {
      finalizeEnding(runtime.pendingEndingId, runtime);
    }
  }, [runtime, endingId, finalizeEnding]);

  const persistRuntime = useCallback((nextRuntime: GameRuntime) => {
    setSave((prev) => {
      const merged: SovietSave = {
        ...prev,
        inProgress: runtimeToProgress(nextRuntime),
      };
      persistSave(merged);
      return merged;
    });
  }, []);

  const handleStart = useCallback(() => {
    unlockAudio();
    void playBgm("ambient");
    setEndingId(null);
    const next = startGame(runtime);
    const { runtime: after, endingId: end } = runUntilLine(next);
    setRuntime(after);
    persistRuntime(after);
    if (end) finalizeEnding(end, after);
  }, [runtime, persistRuntime, finalizeEnding]);

  const handleContinue = useCallback(() => {
    unlockAudio();
    if (save.inProgress) {
      const resumed = createRuntimeFromSave(save, "prologue");
      const { runtime: after, endingId: end } = runUntilLine(resumed);
      setRuntime(after);
      persistRuntime(after);
      if (end) finalizeEnding(end, after);
      return;
    }
    handleStart();
  }, [save, handleStart, persistRuntime, finalizeEnding]);

  const handleAdvance = useCallback(() => {
    if (runtime.awaitingChoice) return;
    const { runtime: after, endingId: end } = runUntilLine(runtime);
    setRuntime(after);
    persistRuntime(after);
    if (end) finalizeEnding(end, after);
  }, [runtime, persistRuntime, finalizeEnding]);

  useEffect(() => {
    if (runtime.phase !== "playing" || runtime.awaitingChoice || endingId) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAdvance();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runtime.phase, runtime.awaitingChoice, endingId, handleAdvance]);

  const handlePick = useCallback(
    (index: number) => {
      const picked = pickChoice(runtime, GAL_NODES, index);
      const { runtime: after, endingId: end } = runUntilLine(picked);
      setRuntime(after);
      persistRuntime(after);
      if (end) finalizeEnding(end, after);
    },
    [runtime, persistRuntime, finalizeEnding],
  );

  const handleRetry = useCallback(() => {
    setEndingId(null);
    const next = startGame(runtime);
    const { runtime: after, endingId: end } = runUntilLine(next);
    setRuntime(after);
    persistRuntime(after);
    if (end) finalizeEnding(end, after);
  }, [runtime, persistRuntime, finalizeEnding]);

  const handleDream = useCallback(() => {
    unlockAudio();
    setEndingId(null);
    const dreamRuntime: GameRuntime = {
      ...runtime,
      phase: "playing",
      nodeId: "dream_sequence",
      stepIndex: 0,
      scene: "dream",
      bgm: "katyusha",
      awaitingChoice: false,
      currentLine: null,
      pendingEndingId: null,
    };
    const { runtime: after, endingId: end } = runUntilLine(dreamRuntime);
    setRuntime(after);
    persistRuntime(after);
    if (end) finalizeEnding(end, after);
  }, [runtime, persistRuntime, finalizeEnding]);

  const toggleMute = useCallback(() => {
    const next = { ...save, muted: !save.muted };
    setMuted(next.muted);
    if (!next.muted) void playBgm(runtime.bgm);
    persistSave(next);
    setSave(next);
  }, [save, runtime.bgm]);

  const activeEndingId = endingId ?? runtime.pendingEndingId;
  const activeEnding = activeEndingId ? ENDINGS[activeEndingId] : null;
  const hasProgress = Boolean(save.inProgress);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#080604] text-[#f5e9d4]">
      <StageBackground scene={runtime.scene} />

      {/* 顶栏：场景名居中，避免与返回按钮重叠 */}
      <header className="relative z-20 shrink-0 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Link
            href="/"
            className="shrink-0 rounded-md border border-white/10 bg-black/25 px-2.5 py-1.5 text-[10px] tracking-wide text-white/55 backdrop-blur-sm sm:text-xs"
          >
            退出
          </Link>
          <p className="min-w-0 flex-1 truncate text-center text-[10px] tracking-[0.12em] text-white/45 sm:text-xs">
            {SCENE_LABELS[runtime.scene]}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-[10px] text-white/55 backdrop-blur-sm sm:text-xs"
            >
              {save.muted ? SITE.unmute : SITE.mute}
            </button>
            {runtime.phase !== "title" && (
              <button
                type="button"
                onClick={() =>
                  setRuntime((r) => ({ ...r, phase: "gallery" }))
                }
                className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-[10px] text-white/55 backdrop-blur-sm sm:text-xs"
              >
                档案
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {runtime.phase === "title" && !activeEnding && (
            <motion.div
              key="title"
              className="flex flex-1 flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-xs tracking-[0.45em] text-[#c41e3a]/80 uppercase">
                {SITE.eyebrow}
              </p>
              <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">
                {SITE.heading}
              </h1>
              <p className="mt-4 max-w-md text-sm text-white/50 sm:text-base">
                {SITE.subheading}
              </p>
              <p className="mt-6 text-sm text-[#d4a853]/80">
                主角：{PROTAGONIST.fullName}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleStart}
                  className="rounded-lg bg-[#c41e3a] px-8 py-3 text-sm font-medium text-white hover:bg-[#a01830]"
                >
                  {SITE.start}
                </button>
                {hasProgress && (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="rounded-lg border border-white/25 px-8 py-3 text-sm text-white/80"
                  >
                    {SITE.continue}
                  </button>
                )}
              </div>
              {save.unlockedEndings.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setRuntime((r) => ({ ...r, phase: "gallery" }))
                  }
                  className="mt-6 text-xs tracking-wider text-white/40 underline"
                >
                  {SITE.gallery}（{save.unlockedEndings.length}）
                </button>
              )}
            </motion.div>
          )}

          {runtime.phase === "playing" && !activeEnding && (
            <motion.div
              key="playing"
              className="relative flex min-h-0 flex-1 flex-col justify-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!choiceOptions && runtime.currentLine && (
                <button
                  type="button"
                  className="absolute inset-0 z-0 cursor-default"
                  onClick={handleAdvance}
                  aria-label={SITE.tapContinue}
                />
              )}
              <div className="relative z-10 mx-auto w-full max-w-2xl space-y-3">
                {choiceOptions ? (
                  <ChoicePanel
                    prompt={
                      runtime.currentLine?.kind === "narrate"
                        ? runtime.currentLine.text
                        : undefined
                    }
                    options={choiceOptions}
                    onPick={handlePick}
                  />
                ) : (
                  <DialogueBox
                    line={runtime.currentLine}
                    hint={SITE.tapContinue}
                    onAdvance={handleAdvance}
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeEnding && runtime.phase === "ending" && (
            <EndingScreen
              key={activeEndingId}
              ending={activeEnding}
              onGallery={() => {
                setEndingId(null);
                setRuntime((r) => ({ ...r, phase: "gallery" }));
              }}
              onRetry={handleRetry}
              onDream={handleDream}
              dreamUnlocked={dreamUnlocked && activeEndingId !== "ending_dream"}
            />
          )}

          {runtime.phase === "gallery" && (
            <EndingGallery
              unlocked={save.unlockedEndings}
              onBack={() =>
                setRuntime((r) => ({
                  ...r,
                  phase: save.inProgress ? "playing" : "title",
                }))
              }
              onPersonality={() =>
                setRuntime((r) => ({ ...r, phase: "personality" }))
              }
              canViewPersonality={save.runHistory.length >= 2}
              dreamUnlocked={dreamUnlocked}
              onDream={handleDream}
            />
          )}

          {runtime.phase === "personality" && (
            <PersonalityResult
              personality={personality}
              stats={averageStats(save.runHistory)}
              onBack={() =>
                setRuntime((r) => ({ ...r, phase: "gallery" }))
              }
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
