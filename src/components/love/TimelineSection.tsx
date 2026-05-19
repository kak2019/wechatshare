"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

import { HOME, TIMELINE } from "@/content/site";

export function TimelineSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const [active, setActive] = useState<string | null>(null);

  return (
    <section
      id="timeline"
      ref={ref}
      className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32"
    >
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[var(--mute)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        {HOME.timeline.eyebrow}
      </motion.p>
      <motion.h2
        className="mt-5 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {HOME.timeline.heading}
        <span className="bg-gradient-to-r from-amber-500/90 via-orange-500/85 to-rose-500/80 bg-clip-text text-transparent">
          {" "}
          {HOME.timeline.headingAccent}
        </span>
      </motion.h2>

      <div className="relative mt-16">
        {/* 桌面：横向丝带 */}
        <div className="relative hidden md:block">
          <svg
            viewBox="0 0 1100 220"
            className="w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffc93c" />
                <stop offset="55%" stopColor="#ff9f43" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            <motion.path
              d="M20 110 C 180 30, 320 190, 480 110 S 760 30, 900 110 S 1080 190, 1080 110"
              fill="none"
              stroke="url(#ribbon)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>

          <div className="absolute inset-0">
            {TIMELINE.map((node, i) => {
              const t = i / (TIMELINE.length - 1);
              const left = `${4 + t * 92}%`;
              const top = i % 2 === 0 ? "18%" : "62%";
              return (
                <motion.button
                  key={node.date}
                  type="button"
                  onClick={() =>
                    setActive((prev) => (prev === node.date ? null : node.date))
                  }
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
                  style={{ left, top }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    delay: 0.1 * i + 0.3,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                  whileHover={{ scale: 1.18 }}
                  aria-label={`${node.date} ${node.title}`}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg shadow-[0_8px_24px_rgba(255,159,67,0.35)] ring-1 ring-amber-300/60">
                    {node.emoji}
                  </span>
                  <span className="mt-2 block whitespace-nowrap text-xs font-medium text-[var(--mute)]">
                    {node.date}
                  </span>

                  <AnimatePresence>
                    {active === node.date ? (
                      <motion.div
                        key="card"
                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-1/2 top-[calc(100%+12px)] z-30 w-[240px] -translate-x-1/2 rounded-2xl bg-white p-4 text-left shadow-[0_16px_50px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.06]"
                      >
                        <p className="text-sm font-semibold text-[#1d1d1f]">
                          {node.title}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-[#6e6e73]">
                          {node.body}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 移动端：竖向胶片 */}
        <ol className="relative md:hidden">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-amber-300/70 via-orange-300/70 to-rose-300/70" />
          {TIMELINE.map((node, i) => (
            <motion.li
              key={node.date}
              className="relative pl-16 pb-10"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.05 * i }}
            >
              <span className="absolute left-3 top-0 grid h-7 w-7 place-items-center rounded-full bg-white text-sm shadow ring-1 ring-amber-300/60">
                {node.emoji}
              </span>
              <p className="text-xs font-medium text-[var(--mute)]">{node.date}</p>
              <h3 className="mt-1 text-base font-semibold">{node.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#6e6e73]">
                {node.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
