"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { LETTERS, LETTERS_PAGE, type Letter } from "@/content/site";

export function LetterboxClient() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = LETTERS.find((l) => l.id === activeId) ?? null;

  const close = useCallback(() => setActiveId(null), []);

  const goTo = useCallback(
    (dir: -1 | 1) => {
      if (!activeId) return;
      const i = LETTERS.findIndex((l) => l.id === activeId);
      const next = (i + dir + LETTERS.length) % LETTERS.length;
      setActiveId(LETTERS[next]?.id ?? null);
    },
    [activeId],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!activeId) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, close, goTo]);

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-amber-800/70"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {LETTERS_PAGE.eyebrow}
      </motion.p>
      <motion.h1
        className="mt-5 text-center text-4xl font-semibold tracking-tight sm:text-5xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.05 }}
      >
        {LETTERS_PAGE.heading}
      </motion.h1>
      <motion.p
        className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-[var(--mute)] sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        {LETTERS_PAGE.subtitle}
      </motion.p>

      {/* 软木板：信封网格 */}
      <div className="relative mt-14 overflow-hidden rounded-[28px] bg-[#fff4d8] p-6 ring-1 ring-amber-200/60 sm:p-10">
        {/* 软木板细颗粒 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(rgba(180,120,60,0.18) 1px, transparent 1px), radial-gradient(rgba(180,120,60,0.10) 1px, transparent 1px)",
            backgroundSize: "16px 16px, 8px 8px",
            backgroundPosition: "0 0, 8px 8px",
          }}
        />
        <div className="relative grid gap-6 sm:grid-cols-2">
          {LETTERS.map((l, i) => (
            <EnvelopeCard
              key={l.id}
              letter={l}
              index={i}
              onClick={() => setActiveId(l.id)}
            />
          ))}
        </div>
      </div>

      {/* 信纸 Modal */}
      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          >
            <motion.div
              className="relative w-full max-w-xl overflow-hidden rounded-[20px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.35)]"
              onClick={(e) => e.stopPropagation()}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, clipPath: "inset(0 0 100% 0)" }
              }
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, clipPath: "inset(0 0 0 0)" }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, clipPath: "inset(0 0 100% 0)" }
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 信纸纹理 */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(255,196,0,0.16) 31px, rgba(255,196,0,0.16) 32px)",
                }}
              />
              <div className="relative p-8 sm:p-12">
                <div className="flex items-center justify-between text-xs text-[var(--mute)]">
                  <span className="uppercase tracking-[0.3em]">
                    {active.from === "me" ? LETTERS_PAGE.fromMe : LETTERS_PAGE.fromYou}
                  </span>
                  <span>{active.date}</span>
                </div>
                <h2 className="mt-4 font-hand-zh text-3xl text-[#3a2f2a] sm:text-4xl">
                  {active.title}
                </h2>
                <div className="mt-6 space-y-4 font-hand-zh text-lg leading-[1.9] text-[#3a2f2a] sm:text-xl">
                  {active.body.map((p, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.3 + 0.12 * i,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-between border-t border-black/[0.06] bg-[#fff9eb] px-6 py-4 text-sm">
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-[#6e6e73] transition hover:bg-amber-100"
                  onClick={() => goTo(-1)}
                >
                  {LETTERS_PAGE.prev}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#1d1d1f] px-4 py-2 text-white transition hover:opacity-85"
                  onClick={close}
                >
                  {LETTERS_PAGE.close}
                </button>
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-[#6e6e73] transition hover:bg-amber-100"
                  onClick={() => goTo(1)}
                >
                  {LETTERS_PAGE.next}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function EnvelopeCard({
  letter,
  index,
  onClick,
}: {
  letter: Letter;
  index: number;
  onClick: () => void;
}) {
  const isMe = letter.from === "me";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group relative aspect-[5/3] overflow-hidden rounded-2xl text-left shadow-[0_18px_50px_rgba(120,75,15,0.18)] transition-transform"
      initial={{ opacity: 0, y: 24, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: 0.05 * index }}
      whileHover={{ y: -4, rotate: 0, scale: 1.02 }}
      style={{
        background: isMe
          ? "linear-gradient(135deg,#fff3d6 0%, #ffd97a 100%)"
          : "linear-gradient(135deg,#ffd6e7 0%, #f59ec4 100%)",
      }}
    >
      {/* 信封三角 */}
      <div
        className="absolute inset-x-0 top-0 h-[60%]"
        style={{
          background: isMe
            ? "linear-gradient(180deg,#ffe9a8,#ffd97a)"
            : "linear-gradient(180deg,#ffcfe1,#f59ec4)",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <span className="z-10 grid h-12 w-12 place-items-center rounded-full bg-white/95 text-xl shadow">
          {isMe ? "💌" : "💖"}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#7c2d12]/70">
          {letter.date}
        </p>
        <p className="mt-1 font-hand-zh text-lg text-[#3a2f2a]">
          {letter.title}
        </p>
      </div>
      <span className="pointer-events-none absolute inset-0 opacity-0 ring-2 ring-white/70 transition-opacity group-hover:opacity-100" />
    </motion.button>
  );
}
