"use client";

import { YANG_PAGE } from "@/content/yanglegeyang";

interface LevelHeaderProps {
  levelId: number;
  onRestart: () => void;
  onReshuffle: () => void;
}

export function LevelHeader({ levelId, onRestart, onReshuffle }: LevelHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 py-1">
      <span className="text-sm font-semibold">{YANG_PAGE.levelLabel(levelId)}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReshuffle}
          className="min-h-[44px] rounded-xl px-3 py-1.5 text-xs font-medium ring-1 ring-black/[0.08] active:scale-95 active:bg-black/[0.04]"
        >
          {YANG_PAGE.shuffle}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="min-h-[44px] rounded-xl px-3 py-1.5 text-xs font-medium ring-1 ring-black/[0.08] active:scale-95 active:bg-black/[0.04]"
        >
          {YANG_PAGE.restart}
        </button>
      </div>
    </div>
  );
}
