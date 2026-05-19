"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";

import { COUPLE, HOME } from "@/content/site";

import { CoupleBlobs } from "./MascotSilhouettes";

type BookVideoHeroProps = {
  videoSrc: string;
  posterSrc?: string;
};

export function BookVideoHero({ videoSrc, posterSrc }: BookVideoHeroProps) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

  const openBook = useCallback(() => {
    if (open) return;
    setOpen(true);
    requestAnimationFrame(() => {
      void videoRef.current?.play().catch(() => {
        /* 浏览器自动播放策略 */
      });
    });
  }, [open]);

  const transition = useMemo(
    () =>
      reduceMotion
        ? { duration: 0.2 }
        : { duration: 1.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    [reduceMotion],
  );

  return (
    <section className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-12">
      <CoupleBlobs />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,214,128,0.35),transparent_55%)]" />

      <motion.p
        className="relative z-10 mb-8 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#6e6e73]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        {HOME.hero.eyebrow}
      </motion.p>

      <div
        className="relative z-10 w-full max-w-[760px]"
        style={{ perspective: 1400 }}
      >
        <motion.div
          className="relative min-h-[min(52vh,440px)] pt-[3px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative min-h-[min(52vh,440px)] overflow-hidden rounded-[28px] bg-black shadow-[0_40px_100px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
            style={{ transformStyle: "preserve-3d" }}
          >
          {/* 影片层 */}
          <div className="absolute inset-0 z-0">
            {videoSrc ? (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src={videoSrc}
                poster={posterSrc}
                controls={open}
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="flex h-full min-h-[min(52vh,440px)] w-full flex-col items-center justify-center bg-gradient-to-br from-[#2a2a2c] to-[#111] px-8 text-center">
                <p className="text-lg font-medium text-white/85">{HOME.hero.noVideo}</p>
              </div>
            )}
          </div>

          {/* 书衣（两半） */}
          <div
            className={`absolute inset-0 z-20 flex ${open ? "pointer-events-none" : "cursor-pointer"}`}
            onClick={!open ? openBook : undefined}
            onKeyDown={
              !open
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openBook();
                    }
                  }
                : undefined
            }
            role={open ? undefined : "button"}
            tabIndex={open ? -1 : 0}
            aria-label={open ? undefined : HOME.hero.openBookAria}
          >
            <motion.div
              className="relative h-full min-h-[min(52vh,440px)] w-1/2 origin-right rounded-l-[26px] border-r border-black/[0.08] bg-gradient-to-br from-[#fff9eb] via-[#fff3d6] to-[#ffe7a8] shadow-[inset_-12px_0_32px_rgba(0,0,0,0.06)]"
              initial={false}
              animate={
                open
                  ? reduceMotion
                    ? { opacity: 0 }
                    : { rotateY: -96, x: -12, opacity: 0 }
                  : { rotateY: 0, x: 0, opacity: 1 }
              }
              transition={transition}
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <div className="flex h-full flex-col justify-between p-6 sm:p-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6a2f]/80">
                  {HOME.hero.left.volume}
                </span>
                <div>
                  <h2 className="text-balance text-2xl font-semibold tracking-tight text-[#1d1d1f] sm:text-3xl">
                    {HOME.hero.left.title[0]}
                    <br />
                    {HOME.hero.left.title[1]}
                  </h2>
                  <p className="mt-3 max-w-[12rem] text-pretty text-sm leading-relaxed text-[#6e6e73]">
                    {HOME.hero.left.subtitle}
                  </p>
                </div>
                <span className="text-xs text-[#ae8a3d]">{HOME.hero.left.hint}</span>
              </div>
            </motion.div>

            <motion.div
              className="relative h-full min-h-[min(52vh,440px)] w-1/2 origin-left rounded-r-[26px] border-l border-white/60 bg-gradient-to-bl from-[#fff6e4] via-[#ffefcf] to-[#ffd978] shadow-[inset_12px_0_32px_rgba(255,255,255,0.45)]"
              initial={false}
              animate={
                open
                  ? reduceMotion
                    ? { opacity: 0 }
                    : { rotateY: 96, x: 12, opacity: 0 }
                  : { rotateY: 0, x: 0, opacity: 1 }
              }
              transition={transition}
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <div className="flex h-full flex-col items-end justify-between p-6 text-right sm:p-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6a2f]/80">
                  {HOME.hero.right.eyebrow}
                </span>
                <div>
                  <p className="text-balance text-2xl font-semibold tracking-tight text-[#1d1d1f] sm:text-3xl">
                    {COUPLE.me}
                    <br />
                    与{COUPLE.you}
                  </p>
                  <p className="mt-3 max-w-[13rem] text-pretty text-sm leading-relaxed text-[#6e6e73]">
                    {HOME.hero.right.subtitle}
                  </p>
                </div>
                <span className="text-xs text-[#ae8a3d]">{HOME.hero.right.hint}</span>
              </div>
            </motion.div>
          </div>
          </div>
        </motion.div>
      </div>

      {!open && (
        <motion.button
          type="button"
          onClick={openBook}
          className="relative z-20 mt-10 rounded-full bg-[#1d1d1f] px-8 py-3 text-sm font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {HOME.hero.cta}
        </motion.button>
      )}

    </section>
  );
}
