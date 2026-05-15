"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { POLAROIDS } from "@/content/site";

function PolaroidCard({
  index,
  caption,
  back,
  gradient,
  rotate,
}: {
  index: number;
  caption: string;
  back: string;
  gradient: [string, string];
  rotate: number;
}) {
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="group relative h-[260px] w-[200px] cursor-pointer select-none sm:h-[300px] sm:w-[230px]"
      style={{ perspective: 1100 }}
      drag={!reduceMotion}
      dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
      dragElastic={0.18}
      dragSnapToOrigin
      whileTap={{ cursor: "grabbing" }}
      initial={{ opacity: 0, y: 24, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.9,
        delay: 0.08 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : { scale: 1.05, rotate: 0, zIndex: 10, y: -6 }
      }
      onClick={() => setFlipped((v) => !v)}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 正面 */}
        <div
          className="absolute inset-0 flex flex-col rounded-[10px] bg-white p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.05]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div
            className="h-[78%] w-full overflow-hidden rounded-[4px]"
            style={{
              background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-5xl drop-shadow-sm">
                {["📷", "🌅", "🌧️", "🍜", "🐱", "⛰️"][index % 6]}
              </span>
            </div>
          </div>
          <p className="mt-3 px-1 font-hand-zh text-base text-[#3a2f2a]">
            {caption}
          </p>
        </div>

        {/* 背面 */}
        <div
          className="absolute inset-0 flex flex-col justify-center rounded-[10px] bg-[#fff9eb] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ring-1 ring-amber-200/60"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="font-hand-en text-sm uppercase tracking-[0.3em] text-amber-700/70">
            note
          </p>
          <p className="mt-3 font-hand-zh text-lg leading-relaxed text-[#3a2f2a]">
            {back}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PolaroidsSection() {
  return (
    <section
      id="polaroids"
      className="relative overflow-hidden bg-gradient-to-b from-[#fff7e6] via-[#fff3d6] to-[#fafafa] py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#fafafa] to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-amber-800/70"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          Polaroid Wall
        </motion.p>
        <motion.h2
          className="mt-5 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          摸一摸，翻一翻
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-[var(--mute)] sm:text-base"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          每一张照片背后都偷偷写了字，点一下就能看见 ✿
        </motion.p>

        <div className="mt-14 flex flex-wrap items-start justify-center gap-x-2 gap-y-10 sm:gap-x-6 sm:gap-y-14">
          {POLAROIDS.map((p, i) => (
            <PolaroidCard
              key={p.id}
              index={i}
              caption={p.caption}
              back={p.back}
              gradient={p.gradient}
              rotate={p.rotate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
