"use client";

import { motion } from "framer-motion";

import type { GlobalEvent } from "@/lib/fish/types";

export function GlobalTicker({
  events,
  weatherActive,
  weatherBuffBy,
}: {
  events: GlobalEvent[];
  weatherActive: boolean;
  weatherBuffBy: string;
}) {
  const latest = events.slice(0, 5);

  return (
    <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 px-4 py-2 text-xs text-indigo-100 ring-1 ring-white/10">
      {weatherActive && (
        <div className="mb-1 font-medium text-amber-200">
          ☀️ 全服天气不错！{weatherBuffBy ? `${weatherBuffBy} 发起的祝福` : ""} — 稀有度 +10%
        </div>
      )}
      {latest.length === 0 ? (
        <div className="text-indigo-300/70">📡 全服频道：抛竿、钓奇物、使用天气不错卡，这里会广播…</div>
      ) : (
        <motion.div
          key={latest[0]?.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-0.5"
        >
          {latest.map((e) => (
            <div key={e.id} className="truncate">
              {e.type === "weather" ? "☀️" : e.type === "dragon" ? "🐉" : e.type === "encounter" ? "🎭" : "🎣"}{" "}
              {e.message}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
