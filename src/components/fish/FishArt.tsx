"use client";

import { motion } from "framer-motion";

import { RARITY_LABELS } from "@/content/fish";
import type { FishDef } from "@/lib/fish/types";

type Phase = "idle" | "casting" | "waiting" | "bite" | "reeling" | "caught";

const RARITY_GRADIENT: Record<string, string> = {
  common: "from-slate-400 to-slate-500",
  uncommon: "from-emerald-400 to-teal-500",
  rare: "from-blue-400 to-indigo-500",
  epic: "from-purple-400 to-fuchsia-500",
  legendary: "from-orange-400 to-amber-500",
  mythical: "from-red-500 via-rose-500 to-amber-400",
  treasure: "from-amber-400 to-yellow-500",
  card: "from-pink-400 to-rose-500",
  equipment: "from-cyan-400 to-teal-500",
};

interface FishArtProps {
  phase: Phase;
  fish?: FishDef | null;
  sceneEmoji?: string;
}

export function FishArt({ phase, fish, sceneEmoji = "🌊" }: FishArtProps) {
  const gradient = fish ? (RARITY_GRADIENT[fish.rarity] ?? "from-teal-400 to-blue-500") : "from-teal-300 to-blue-400";

  return (
    <div className="relative mx-auto h-56 w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100/80 to-blue-200/60 ring-1 ring-white/40">
      {/* 水波纹 */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-blue-500/30 to-transparent"
        animate={{ opacity: phase === "waiting" || phase === "bite" ? [0.4, 0.7, 0.4] : 0.35 }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* 抛竿动画 */}
      {(phase === "casting" || phase === "waiting" || phase === "bite" || phase === "reeling") && (
        <motion.div
          className="absolute left-1/2 top-4 origin-bottom -translate-x-1/2 text-4xl"
          initial={{ rotate: -30 }}
          animate={
            phase === "casting"
              ? { rotate: [-30, 15, -5], y: [0, -8, 0] }
              : phase === "bite"
                ? { rotate: [-5, 8, -8, 10], y: [0, 4, -2, 6] }
                : { rotate: -5, y: 0 }
          }
          transition={
            phase === "casting"
              ? { duration: 0.5 }
              : phase === "bite"
                ? { repeat: Infinity, duration: 0.35 }
                : { duration: 0.3 }
          }
        >
          🎣
        </motion.div>
      )}

      {/* 浮漂 */}
      {(phase === "waiting" || phase === "bite") && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 text-2xl"
          animate={
            phase === "bite"
              ? { y: [0, -12, 4, -16, 0], scale: [1, 1.2, 1, 1.3, 1] }
              : { y: [0, -4, 0, 3, 0] }
          }
          transition={{ repeat: Infinity, duration: phase === "bite" ? 0.4 : 1.8 }}
        >
          {phase === "bite" ? "🔴" : "🟡"}
        </motion.div>
      )}

      {/* 收竿水花 */}
      {phase === "reeling" && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 text-5xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
          transition={{ duration: 0.5 }}
        >
          💦
        </motion.div>
      )}

      {/* 中鱼展示 */}
      {(phase === "caught" || phase === "reeling") && fish && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ y: 80, opacity: 0, scale: 0.3 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-4 ring-white/60`}
          >
            <span className="text-6xl drop-shadow-lg">{fish.ascii}</span>
          </div>
          <motion.p
            className="mt-3 text-lg font-bold text-white drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {fish.name}
          </motion.p>
          <p className={`text-xs font-medium ${RARITY_LABELS[fish.rarity]?.color ?? "text-white"} drop-shadow`}>
            {RARITY_LABELS[fish.rarity]?.label}
          </p>
        </motion.div>
      )}

      {/* 空闲场景 */}
      {phase === "idle" && !fish && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400/60">
          <span className="text-5xl">{sceneEmoji}</span>
          <p className="mt-2 text-xs">点击下方抛竿</p>
        </div>
      )}

      {/* 金色闪光（传奇+） */}
      {phase === "caught" && fish && (fish.rarity === "legendary" || fish.rarity === "mythical") && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-300/40 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.3] }}
          transition={{ duration: 1.2 }}
        />
      )}
    </div>
  );
}
