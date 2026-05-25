"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { SITE } from "@/content/soviet-vn/meta";

export function SovietRevivalEntry() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/game/soviet-revival"
          className="group relative block overflow-hidden rounded-[24px] border border-[#8b1a1a]/30 bg-[#1a0a0a] p-6 shadow-[0_20px_60px_rgba(139,26,26,0.15)] ring-1 ring-[#c41e3a]/20 transition hover:border-[#c41e3a]/50 sm:p-8"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-conic-gradient(from 0deg at 80% 20%, #c41e3a 0deg 1deg, transparent 1deg 12deg)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#c41e3a]/10 via-transparent to-black/40" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#c41e3a]/80 sm:text-xs">
                {SITE.homeEntry.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#f5e9d4] sm:text-3xl">
                {SITE.homeEntry.title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#d4c4a8]/70">
                {SITE.homeEntry.subtitle}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#c41e3a] px-5 py-2.5 text-sm font-medium text-white transition group-hover:bg-[#a01830]">
              {SITE.homeEntry.cta} →
            </span>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
