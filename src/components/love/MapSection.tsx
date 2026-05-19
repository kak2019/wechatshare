"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { HOME, PLACES, UI } from "@/content/site";

/**
 * 用一张极度简化的"东亚轮廓"SVG 作为底图，避免依赖外部地图瓦片。
 * viewBox: 600 × 360，所有 PLACES 的 (x, y) 都基于这个坐标系。
 */

const OUTLINE_PATH =
  // 中国轮廓 — 简化、艺术化处理
  "M120 90 C 180 60, 260 70, 320 96 C 360 80, 420 84, 460 100 C 520 90, 560 130, 540 180 C 560 220, 510 260, 470 270 C 430 300, 380 296, 320 286 C 270 312, 210 308, 170 286 C 130 296, 100 270, 96 230 C 70 200, 80 150, 120 130 Z";

const JP_PATH =
  "M515 120 C 540 110, 560 140, 555 170 C 580 180, 575 220, 545 230 C 530 210, 520 180, 515 120 Z";

const KR_PATH =
  "M500 110 C 515 105, 525 130, 518 150 C 510 140, 498 130, 500 110 Z";

export function MapSection() {
  const [active, setActive] = useState<string | null>(null);
  const activePlace = PLACES.find((p) => p.id === active);

  return (
    <section
      id="map"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32"
    >
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[var(--mute)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        {HOME.map.eyebrow}
      </motion.p>
      <motion.h2
        className="mt-5 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.05 }}
      >
        {HOME.map.heading}
      </motion.h2>

      <div className="relative mt-12 overflow-hidden rounded-[28px] bg-[#fff9eb] p-4 ring-1 ring-amber-200/50 sm:p-8">
        <svg viewBox="0 0 600 360" className="w-full">
          <defs>
            <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde8c4" />
              <stop offset="100%" stopColor="#f6d186" />
            </linearGradient>
            <radialGradient id="pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
          </defs>

          <motion.path
            d={OUTLINE_PATH}
            fill="url(#land)"
            stroke="#e0a96d"
            strokeWidth="1.4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2 }}
          />
          <motion.path
            d={KR_PATH}
            fill="url(#land)"
            stroke="#e0a96d"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, delay: 0.15 }}
          />
          <motion.path
            d={JP_PATH}
            fill="url(#land)"
            stroke="#e0a96d"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, delay: 0.25 }}
          />

          {/* 城市点 */}
          {PLACES.map((p, i) => (
            <g key={p.id}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="20"
                fill="url(#pulse)"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: [0, 1.6, 1], opacity: [0, 0.7, 0.4] }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.6, delay: 0.4 + 0.1 * i, repeat: Infinity, repeatDelay: 2.5 }}
              />
              <motion.g
                style={{ cursor: "pointer" }}
                onClick={() => setActive((prev) => (prev === p.id ? null : p.id))}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.4 + 0.1 * i,
                }}
                whileHover={{ scale: 1.4 }}
              >
                <circle cx={p.x} cy={p.y} r="6" fill="#f43f5e" />
                <circle cx={p.x} cy={p.y} r="2.4" fill="#fff" />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="fill-[#7c2d12] font-medium"
                  fontSize="11"
                >
                  {p.city}
                </text>
              </motion.g>
            </g>
          ))}
        </svg>

        <AnimatePresence>
          {activePlace ? (
            <motion.div
              key={activePlace.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-4 left-1/2 w-[min(420px,92%)] -translate-x-1/2 rounded-2xl bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.06]"
            >
              <p className="text-xs uppercase tracking-[0.28em] text-amber-700/70">
                {activePlace.date}
              </p>
              <p className="mt-2 text-lg font-semibold">{activePlace.city}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">
                {activePlace.memo}
              </p>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#f5f5f7] text-xs text-[#6e6e73] transition hover:bg-[#e5e5ea]"
                aria-label={UI.close}
              >
                ×
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--mute)]">
        {HOME.map.footer}
      </p>
    </section>
  );
}
