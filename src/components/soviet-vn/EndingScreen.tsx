"use client";

import { motion } from "framer-motion";

import type { EndingDef } from "@/lib/soviet-vn/types";

type EndingScreenProps = {
  ending: EndingDef;
  onGallery: () => void;
  onRetry: () => void;
  onDream?: () => void;
  dreamUnlocked?: boolean;
};

export function EndingScreen({
  ending,
  onGallery,
  onRetry,
  onDream,
  dreamUnlocked,
}: EndingScreenProps) {
  const isDream = ending.tone === "dream";

  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <p className="text-xs tracking-[0.4em] text-[#c41e3a]/70 uppercase">
        {isDream ? "梦幻结局" : "结局"}
      </p>
      <h1 className="mt-4 text-center text-3xl font-semibold text-[#f5e9d4] sm:text-5xl">
        {ending.title}
      </h1>
      <p className="mt-2 text-center text-sm text-white/50">{ending.subtitle}</p>

      <div className="mt-8 max-w-lg space-y-4">
        {ending.body.map((para, i) => (
          <motion.p
            key={para}
            className="text-center leading-relaxed text-[#d4c4a8]/90 sm:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.2 }}
          >
            {para}
          </motion.p>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {!isDream && dreamUnlocked && onDream && (
          <button
            type="button"
            onClick={onDream}
            className="rounded-lg border border-[#ffd700]/50 bg-[#ffd700]/10 px-5 py-2.5 text-sm text-[#ffd700] hover:bg-[#ffd700]/20"
          >
            进入梦幻结局
          </button>
        )}
        <button
          type="button"
          onClick={onGallery}
          className="rounded-lg border border-white/20 px-5 py-2.5 text-sm text-white/70 hover:bg-white/5"
        >
          结局档案馆
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-[#c41e3a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#a01830]"
        >
          再试一次
        </button>
      </div>
    </motion.div>
  );
}
