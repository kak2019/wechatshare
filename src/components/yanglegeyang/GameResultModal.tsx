"use client";

import { motion } from "framer-motion";

import { YANG_PAGE } from "@/content/yanglegeyang";

interface GameResultModalProps {
  phase: "won" | "lost";
  levelId: number;
  onRetry: () => void;
  onNext: () => void;
}

export function GameResultModal({ phase, levelId, onRetry, onNext }: GameResultModalProps) {
  const won = phase === "won";
  const cleared = won && levelId >= 2;

  const title = won
    ? levelId <= 1
      ? YANG_PAGE.winTitleLevel1
      : YANG_PAGE.winTitleLevel2
    : YANG_PAGE.loseTitle;

  const body = won
    ? levelId <= 1
      ? YANG_PAGE.winBodyLevel1
      : YANG_PAGE.winBodyLevel2
    : YANG_PAGE.loseBody;

  const nextLabel = levelId <= 1 ? YANG_PAGE.enterLevel2 : YANG_PAGE.playAgain;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-black/[0.06]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="text-5xl">{cleared ? "🐑" : won ? "🎉" : "😿"}</div>
        <h2 className="mt-3 text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-[var(--mute)]">{body}</p>
        {!won && (
          <p className="mt-1 text-xs text-[var(--mute)]">{YANG_PAGE.levelLabel(levelId)}</p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          {won ? (
            <button
              type="button"
              onClick={onNext}
              className="min-h-[48px] rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 font-semibold text-white active:scale-[0.98]"
            >
              {nextLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[48px] rounded-2xl bg-gray-100 py-3 font-medium active:scale-[0.98]"
          >
            {YANG_PAGE.retry}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
