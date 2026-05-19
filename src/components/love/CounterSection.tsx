"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { HOME } from "@/content/site";
import { useCountdown } from "@/lib/useCountdown";

function FlipDigit({ value }: { value: string }) {
  return (
    <span className="relative inline-block w-[0.58em] overflow-hidden text-center align-baseline">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-gradient-to-b from-amber-500/95 via-orange-500/90 to-rose-500/85 bg-clip-text text-transparent"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FlipNumber({ value, minDigits = 2 }: { value: number; minDigits?: number }) {
  const str = String(value).padStart(minDigits, "0");
  return (
    <span className="inline-flex tabular-nums">
      {str.split("").map((c, i) => (
        <FlipDigit key={`${i}-${c}`} value={c} />
      ))}
    </span>
  );
}

export function CounterSection() {
  const { days, hours, minutes, seconds, nextAnniversary } = useCountdown();
  const [tip, setTip] = useState(false);

  return (
    <section
      id="counter"
      className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 sm:pb-24 sm:pt-28"
    >
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[var(--mute)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {HOME.counter.eyebrow}
      </motion.p>

      <motion.h2
        className="mt-5 text-center text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {HOME.counter.heading}
      </motion.h2>

      <div
        className="relative mt-10 flex items-end justify-center gap-3 sm:gap-5"
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
      >
        <motion.div
          className="flex items-baseline font-semibold leading-none tracking-tight"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-[18vw] sm:text-[160px]">
            <FlipNumber value={days} minDigits={3} />
          </span>
          <span className="ml-2 text-2xl text-[var(--mute)] sm:text-3xl">{HOME.counter.units.day}</span>
        </motion.div>

        <motion.span
          aria-hidden
          className="mb-5 inline-block text-3xl sm:text-4xl"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          💗
        </motion.span>

        <AnimatePresence>
          {tip && nextAnniversary ? (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute -top-4 right-2 rounded-2xl bg-[#1d1d1f] px-4 py-2 text-xs font-medium text-white shadow-lg sm:right-8"
            >
              {HOME.counter.anniversaryTip
                .replace("{label}", nextAnniversary.label)
                .replace("{days}", String(nextAnniversary.daysLeft))
                .replace("{emoji}", nextAnniversary.emoji)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--mute)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="tabular-nums">
          <FlipNumber value={hours} /> {HOME.counter.units.hour}
        </span>
        <span className="tabular-nums">
          <FlipNumber value={minutes} /> {HOME.counter.units.minute}
        </span>
        <span className="tabular-nums">
          <FlipNumber value={seconds} /> {HOME.counter.units.second}
        </span>
        {nextAnniversary ? (
          <span className="font-hand-en text-base text-amber-700/70">
            {HOME.counter.nextPrefix}{nextAnniversary.label} {nextAnniversary.emoji}
          </span>
        ) : null}
      </motion.div>
    </section>
  );
}
