"use client";

import { motion, AnimatePresence } from "framer-motion";

import { MAX_DOCK } from "@/content/yanglegeyang";
import { getTileEmoji } from "@/lib/yanglegeyang/engine";

interface DockBarProps {
  dock: string[];
}

export function DockBar({ dock }: DockBarProps) {
  const slots = Array.from({ length: MAX_DOCK }, (_, i) => dock[i] ?? null);

  return (
    <div className="sticky bottom-0 shrink-0 rounded-2xl bg-[var(--background)]/95 py-2 backdrop-blur">
      <div className="grid grid-cols-7 gap-1">
        {slots.map((typeId, i) => (
          <div
            key={i}
            className="flex aspect-square min-h-[44px] items-center justify-center rounded-xl bg-white/90 ring-1 ring-black/[0.08]"
          >
            <AnimatePresence mode="popLayout">
              {typeId ? (
                <motion.span
                  key={`${i}-${typeId}-${dock.slice(0, i + 1).length}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-xl"
                >
                  {getTileEmoji(typeId)}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
