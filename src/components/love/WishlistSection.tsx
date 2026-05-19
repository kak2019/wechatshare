"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { HOME, WISHES, UI } from "@/content/site";

type HeartBurst = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
};

const STORAGE_KEY = "wishlist:checked:v1";

export function WishlistSection() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [bursts, setBursts] = useState<HeartBurst[]>([]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setChecked(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked]);

  const { mineList, yoursList, completed } = useMemo(() => {
    const m = WISHES.filter((w) => w.from === "me");
    const y = WISHES.filter((w) => w.from === "you");
    const c = WISHES.reduce((acc, w) => acc + (checked[w.id] ? 1 : 0), 0);
    return { mineList: m, yoursList: y, completed: c };
  }, [checked]);

  const toggle = (id: string, fromButton?: HTMLButtonElement | null) => {
    const wasChecked = !!checked[id];
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!wasChecked && fromButton) {
      const rect = fromButton.getBoundingClientRect();
      const containerRect = fromButton
        .closest("[data-wishlist-root]")
        ?.getBoundingClientRect();
      const baseX = rect.left + rect.width / 2 - (containerRect?.left ?? 0);
      const baseY = rect.top + rect.height / 2 - (containerRect?.top ?? 0);
      const now = Date.now();
      const next: HeartBurst[] = Array.from({ length: 7 }).map((_, i) => ({
        id: now + i,
        x: baseX,
        y: baseY,
        dx: (Math.random() - 0.5) * 80,
        dy: -40 - Math.random() * 60,
        rot: (Math.random() - 0.5) * 60,
      }));
      setBursts((prev) => [...prev, ...next]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id < now));
      }, 1200);
    }
  };

  return (
    <section
      id="wishlist"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32"
      data-wishlist-root
    >
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[var(--mute)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        {HOME.wishlist.eyebrow}
      </motion.p>
      <motion.h2
        className="mt-5 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.05 }}
      >
        {HOME.wishlist.heading}
      </motion.h2>
      <p className="mt-3 text-center text-sm text-[var(--mute)]">
        {HOME.wishlist.progress
          .replace("{done}", String(completed))
          .replace("{total}", String(WISHES.length))}
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <WishColumn
          title={HOME.wishlist.mineColumn}
          accent="from-amber-400 to-orange-500"
          items={mineList}
          checked={checked}
          onToggle={toggle}
        />
        <WishColumn
          title={HOME.wishlist.yoursColumn}
          accent="from-rose-400 to-pink-500"
          items={yoursList}
          checked={checked}
          onToggle={toggle}
        />
      </div>

      {/* 爱心粒子层 */}
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.span
              key={b.id}
              className="absolute text-base"
              style={{ left: b.x, top: b.y }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
              animate={{
                opacity: 0,
                x: b.dx,
                y: b.dy,
                scale: 1.2,
                rotate: b.rot,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              ❤
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function WishColumn({
  title,
  accent,
  items,
  checked,
  onToggle,
}: {
  title: string;
  accent: string;
  items: { id: string; text: string }[];
  checked: Record<string, boolean>;
  onToggle: (id: string, btn: HTMLButtonElement | null) => void;
}) {
  return (
    <motion.div
      className="rounded-3xl bg-white p-6 shadow-[0_2px_40px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] sm:p-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <p
        className={`bg-gradient-to-r ${accent} bg-clip-text text-sm font-semibold uppercase tracking-[0.25em] text-transparent`}
      >
        {UI.listEyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>

      <ul className="mt-6 space-y-3">
        {items.map((w) => {
          const on = !!checked[w.id];
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={(e) => onToggle(w.id, e.currentTarget)}
                className="group flex w-full items-center gap-4 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-amber-50/60"
              >
                <span
                  className={[
                    "relative grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    on
                      ? "border-amber-500 bg-amber-500"
                      : "border-[#d2d2d7] bg-white group-hover:border-amber-300",
                  ].join(" ")}
                >
                  <AnimatePresence>
                    {on ? (
                      <motion.svg
                        key="check"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                      >
                        <motion.path
                          d="M3 7.5l3 3 5-6"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.35 }}
                        />
                      </motion.svg>
                    ) : null}
                  </AnimatePresence>
                </span>
                <span
                  className={[
                    "text-sm transition-colors",
                    on
                      ? "text-[var(--mute)] line-through decoration-amber-400/70 decoration-2"
                      : "text-[#1d1d1f]",
                  ].join(" ")}
                >
                  {w.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
