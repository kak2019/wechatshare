"use client";

import { YANG_PAGE } from "@/content/yanglegeyang";
import type { PropsRemaining } from "@/lib/yanglegeyang/types";

interface PropBarProps {
  propsRemaining: PropsRemaining;
  onUndo: () => void;
  onShuffle: () => void;
  onRemove: () => void;
  disabled: boolean;
}

export function PropBar({ propsRemaining, onUndo, onShuffle, onRemove, disabled }: PropBarProps) {
  const items = [
    { key: "undo" as const, label: YANG_PAGE.props.undo, emoji: "↩️", count: propsRemaining.undo, onClick: onUndo },
    { key: "shuffle" as const, label: YANG_PAGE.props.shuffle, emoji: "🔀", count: propsRemaining.shuffle, onClick: onShuffle },
    { key: "remove" as const, label: YANG_PAGE.props.remove, emoji: "📤", count: propsRemaining.remove, onClick: onRemove },
  ];

  return (
    <div className="flex shrink-0 justify-center gap-3 py-2">
      {items.map((item) => {
        const canUse = !disabled && item.count > 0;
        return (
          <button
            key={item.key}
            type="button"
            disabled={!canUse}
            onClick={item.onClick}
            className={[
              "flex min-h-[48px] min-w-[72px] flex-col items-center justify-center rounded-2xl px-2 py-1 text-xs font-medium ring-1",
              canUse
                ? "bg-white ring-amber-200/80 active:scale-95"
                : "bg-gray-50 opacity-40 ring-gray-200",
            ].join(" ")}
          >
            <span className="text-lg">{item.emoji}</span>
            <span>{item.label}</span>
            <span className="text-[10px] text-[var(--mute)]">×{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}
