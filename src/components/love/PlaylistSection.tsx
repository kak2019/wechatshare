"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { HOME, PLAYLIST, UI } from "@/content/site";

export function PlaylistSection() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(PLAYLIST[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const active = PLAYLIST.find((t) => t.id === activeId) ?? PLAYLIST[0];

  return (
    <section
      id="playlist"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32"
    >
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[var(--mute)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        {HOME.playlist.eyebrow}
      </motion.p>
      <motion.h2
        className="mt-5 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.05 }}
      >
        {HOME.playlist.heading}
      </motion.h2>

      <div className="mt-14 grid items-center gap-10 md:grid-cols-[1fr_1fr]">
        {/* 黑胶唱片 */}
        <div className="relative mx-auto aspect-square w-full max-w-[340px]">
          <motion.div
            className="relative h-full w-full rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${active.vinyl[1]} 0%, ${active.vinyl[0]} 60%, #000 100%)`,
              animation:
                playing && !reduceMotion
                  ? "vinyl-spin 12s linear infinite"
                  : "none",
              boxShadow:
                "0 30px 70px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {[88, 76, 64, 52, 40].map((r) => (
              <span
                key={r}
                className="absolute inset-0 m-auto rounded-full border border-white/5"
                style={{ width: `${r}%`, height: `${r}%` }}
              />
            ))}
            <div className="absolute inset-0 m-auto grid h-[26%] w-[26%] place-items-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-white shadow-inner">
              <span className="text-2xl">♥</span>
            </div>
          </motion.div>

          {/* 唱针 */}
          <motion.div
            className="absolute -right-2 -top-4 sm:-right-6 sm:-top-6 origin-top-right"
            animate={{ rotate: playing ? -8 : -22 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div className="relative h-[150px] w-[20px]">
              <div className="absolute right-0 top-0 h-5 w-5 rounded-full bg-[#1d1d1f]" />
              <div className="absolute left-1/2 top-3 h-[120px] w-[6px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#1d1d1f] to-[#3a3a3c]" />
              <div className="absolute left-1/2 bottom-0 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-400" />
            </div>
          </motion.div>
        </div>

        {/* 歌单 + 歌词 */}
        <div className="relative">
          <div className="relative h-[140px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d1d1f] to-[#3a2f2a] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {UI.nowPlaying}
            </p>
            <p className="mt-2 text-xl font-semibold">{active.title}</p>
            <p className="text-sm text-white/70">{active.artist}</p>

            <AnimatePresence mode="wait">
              <motion.p
                key={active.id}
                className="font-hand-zh mt-4 text-base leading-relaxed text-amber-200/90"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
              >
                {active.lyric}
              </motion.p>
            </AnimatePresence>
          </div>

          <ul className="mt-6 space-y-2">
            {PLAYLIST.map((t) => {
              const on = t.id === active.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (on) {
                        setPlaying((p) => !p);
                      } else {
                        setActiveId(t.id);
                        setPlaying(true);
                      }
                    }}
                    className={[
                      "group flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
                      on
                        ? "border-amber-400/50 bg-amber-50"
                        : "border-black/[0.06] bg-white hover:border-amber-300/40 hover:bg-amber-50/60",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-9 w-9 place-items-center rounded-full text-sm",
                        on
                          ? "bg-[#1d1d1f] text-amber-300"
                          : "bg-[#f5f5f7] text-[#1d1d1f] group-hover:bg-amber-100",
                      ].join(" ")}
                    >
                      {on && playing ? "❚❚" : "▶"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-[var(--mute)]">{t.artist}</p>
                    </div>
                    {on ? (
                      <span className="text-xs text-amber-700/70">{UI.playing}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-center text-xs text-[var(--mute)]">
            {HOME.playlist.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}
