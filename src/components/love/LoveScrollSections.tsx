"use client";

import { motion } from "framer-motion";

import { HOME } from "@/content/site";

import { CounterSection } from "./CounterSection";
import { LineDogOutline } from "./MascotSilhouettes";
import { MapSection } from "./MapSection";
import { PlaylistSection } from "./PlaylistSection";
import { PolaroidsSection } from "./PolaroidsSection";
import { TimelineSection } from "./TimelineSection";
import { WishlistSection } from "./WishlistSection";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      delay: 0.08 * i,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function LoveScrollSections() {
  return (
    <div className="relative bg-[var(--background)]">
      {/* 倒数日 */}
      <CounterSection />

      {/* 故事 */}
      <section
        id="story"
        className="mx-auto max-w-5xl px-6 pb-16 pt-12 sm:pb-24 sm:pt-20"
      >
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[var(--mute)]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {HOME.story.eyebrow}
        </motion.p>
        <motion.h2
          className="mt-6 text-center text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl sm:leading-[1.05]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: 32 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 1, delay: 0.06, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {HOME.story.heading}
          <span className="bg-gradient-to-r from-amber-500/90 via-orange-500/85 to-rose-500/80 bg-clip-text text-transparent">
            {HOME.story.headingAccent}
          </span>
        </motion.h2>
        <motion.p
          className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-[var(--mute)] sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {HOME.story.body}
        </motion.p>
      </section>

      {/* 瞬间三章 */}
      <section
        id="moments"
        className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {HOME.moments.map((m, i) => (
            <motion.article
              key={m.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-[0_2px_40px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,0,0,0.1)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-100/0 via-transparent to-orange-100/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#ae8a3d]">
                {m.date}
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {m.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--mute)]">
                {m.body}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* 时间轴 */}
      <TimelineSection />

      {/* 照片墙 */}
      <PolaroidsSection />

      {/* 歌单 */}
      <PlaylistSection />

      {/* 足迹地图 */}
      <MapSection />

      {/* 心愿清单 */}
      <WishlistSection />

      {/* 引言 + 线条小狗 */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32 text-center">
        <motion.div
          className="rounded-[32px] bg-[#1d1d1f] px-8 py-16 text-white shadow-[0_40px_100px_rgba(0,0,0,0.22)] sm:px-16 sm:py-20"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
            {HOME.closing.eyebrow}
          </p>
          <p className="mt-8 text-2xl font-medium leading-snug tracking-tight text-white/95 sm:text-3xl">
            &ldquo;{HOME.closing.quote}&rdquo;
          </p>
        </motion.div>

        <div className="relative mt-16 min-h-[160px]">
          <LineDogOutline />
        </div>
      </section>
    </div>
  );
}
