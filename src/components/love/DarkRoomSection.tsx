"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import { HOME } from "@/content/site";

const DEFAULT_AUDIO = "/audio/iloveyou-voice.mp3";

function audioSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DARK_ROOM_AUDIO_URL?.trim();
  return fromEnv || DEFAULT_AUDIO;
}

/** 暗室场景：线条小金毛默默流泪，触碰发光小白玩偶播放 I love you（克隆声线 MP3） */
export function DarkRoomSection() {
  const [touched, setTouched] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioMissing, setAudioMissing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playLove = useCallback(async () => {
    setTouched(true);

    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc());
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;
    audio.currentTime = 0;

    try {
      setPlaying(true);
      setAudioMissing(false);
      await audio.play();
    } catch {
      setAudioMissing(true);
      setPlaying(false);
      return;
    }

    audio.onended = () => setPlaying(false);
  }, []);

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[var(--mute)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {HOME.darkRoom.eyebrow}
      </motion.p>

      <motion.h2
        className="mt-6 text-center text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {HOME.darkRoom.heading}
        <span className="bg-gradient-to-r from-indigo-400/90 via-violet-400/85 to-fuchsia-400/80 bg-clip-text text-transparent">
          {HOME.darkRoom.headingAccent}
        </span>
      </motion.h2>

      <motion.p
        className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-[var(--mute)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {HOME.darkRoom.hint}
      </motion.p>

      <motion.div
        className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-[28px] shadow-[0_40px_120px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06]"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg
          viewBox="0 0 720 420"
          className="block w-full select-none"
          role="img"
          aria-label={HOME.darkRoom.hint}
        >
          <defs>
            <linearGradient id="dr-wall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0c0c14" />
              <stop offset="100%" stopColor="#06060a" />
            </linearGradient>
            <linearGradient id="dr-floor" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#12121a" />
              <stop offset="50%" stopColor="#1a1a24" />
              <stop offset="100%" stopColor="#12121a" />
            </linearGradient>
            <radialGradient id="dr-moon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e8eef8" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#8ba4c8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#8ba4c8" stopOpacity="0" />
            </radialGradient>
            <filter id="dr-plush-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dr-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 暗室背景 */}
          <rect width="720" height="420" fill="url(#dr-wall)" />
          <polygon points="0,280 720,280 720,420 0,420" fill="url(#dr-floor)" />
          <line x1="0" y1="280" x2="720" y2="280" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />

          {/* 墙角与窗光 */}
          <polygon points="0,0 180,0 180,280 0,280" fill="#080810" opacity="0.6" />
          <rect x="520" y="48" width="72" height="96" rx="4" fill="#0a0a12" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" />
          <ellipse cx="556" cy="96" rx="90" ry="110" fill="url(#dr-moon)" />

          {/* 月光投影 */}
          <polygon points="556,144 620,280 480,280" fill="#6b8fc4" opacity="0.04" />

          {/* 小金毛 — 线条原创风格 */}
          <g stroke="#c9a86c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85">
            {/* 身体 */}
            <path d="M 200 268 Q 168 248 162 218 Q 158 188 178 168 Q 198 152 228 158 Q 248 162 262 178" />
            <path d="M 262 178 Q 290 168 318 178 Q 348 192 352 228 Q 356 258 332 278 Q 308 292 268 288 Q 228 284 200 268" />
            {/* 前腿 */}
            <path d="M 218 278 L 214 302" />
            <path d="M 248 282 L 246 304" />
            {/* 后腿 */}
            <path d="M 310 276 L 318 300" />
            <path d="M 338 268 L 346 294" />
            {/* 头 */}
            <ellipse cx="186" cy="178" rx="38" ry="34" />
            {/* 耳朵 */}
            <path d="M 158 162 Q 148 138 162 128 Q 172 122 180 148" />
            <path d="M 214 158 Q 228 132 240 142 Q 248 152 232 168" />
            {/* 尾巴 */}
            <motion.path
              d="M 348 228 Q 378 210 388 182"
              animate={touched && !playing ? { rotate: [0, 8, -6, 4, 0] } : { rotate: 0 }}
              style={{ transformOrigin: "348px 228px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* 脸 */}
            <circle cx="174" cy="172" r="3.5" fill="#c9a86c" stroke="none" />
            <circle cx="198" cy="172" r="3.5" fill="#c9a86c" stroke="none" />
            <path d="M 182 188 Q 188 192 194 188" strokeWidth="2" />
            {/* 眉毛 — 委屈 */}
            <path d="M 166 162 Q 174 158 182 160" strokeWidth="1.8" />
            <path d="M 190 160 Q 198 158 206 162" strokeWidth="1.8" />
          </g>

          {/* 眼泪 */}
          <motion.g
            animate={{ opacity: touched && playing ? 0.25 : 1 }}
            transition={{ duration: 0.6 }}
          >
            {[0, 1].map((i) => (
              <motion.ellipse
                key={i}
                cx={174 + i * 24}
                cy={182}
                rx="3"
                ry="5"
                fill="#7eb8e8"
                opacity="0.7"
                animate={{ cy: [182, 198, 182], opacity: [0.3, 0.85, 0.3] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
            <motion.path
              d="M 172 190 Q 170 210 168 228"
              stroke="#7eb8e8"
              strokeWidth="1.5"
              fill="none"
              opacity="0.35"
              animate={{ pathLength: [0.2, 1, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 196 190 Q 198 212 200 232"
              stroke="#7eb8e8"
              strokeWidth="1.5"
              fill="none"
              opacity="0.35"
              animate={{ pathLength: [0.2, 1, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
            />
          </motion.g>

          {/* 发光小白玩偶 — 可点击 */}
          <motion.g
            role="button"
            tabIndex={0}
            aria-label={HOME.darkRoom.plushAria}
            className="cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400/60"
            filter="url(#dr-plush-glow)"
            animate={
              playing
                ? {
                    scale: [1, 1.06, 1.03, 1.06, 1],
                    filter: ["brightness(1.2)", "brightness(1.8)", "brightness(1.5)", "brightness(1.8)", "brightness(1.2)"],
                  }
                : touched
                  ? { scale: 1.02, filter: "brightness(1.35)" }
                  : {
                      scale: [1, 1.02, 1],
                      filter: ["brightness(1)", "brightness(1.15)", "brightness(1)"],
                    }
            }
            transition={
              playing
                ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                : touched
                  ? { duration: 0.4 }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ transformOrigin: "480px 248px" }}
            onClick={playLove}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void playLove();
              }
            }}
          >
            {/* 外圈光晕 */}
            <ellipse cx="480" cy="248" rx="52" ry="58" fill="#ffffff" opacity={playing ? 0.22 : 0.1} />
            {/* 玩偶身体 */}
            <ellipse cx="480" cy="252" rx="36" ry="42" fill="#f8f6ff" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
            {/* 头 */}
            <circle cx="480" cy="208" r="28" fill="#faf8ff" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.45" />
            {/* 眼睛 */}
            <circle cx="470" cy="206" r="3" fill="#2a2438" opacity="0.5" />
            <circle cx="490" cy="206" r="3" fill="#2a2438" opacity="0.5" />
            {/* 腮红 */}
            <ellipse cx="462" cy="214" rx="6" ry="3.5" fill="#f0a8c0" opacity="0.35" />
            <ellipse cx="498" cy="214" rx="6" ry="3.5" fill="#f0a8c0" opacity="0.35" />
            {/* 小手 */}
            <ellipse cx="448" cy="248" rx="10" ry="14" fill="#f5f3ff" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
            <ellipse cx="512" cy="248" rx="10" ry="14" fill="#f5f3ff" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
          </motion.g>

          {/* 触碰提示光点 */}
          {!touched ? (
            <motion.circle
              cx="480"
              cy="230"
              r="4"
              fill="#ffffff"
              opacity="0.6"
              animate={{ opacity: [0.2, 0.7, 0.2], r: [3, 5, 3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
        </svg>

        <AnimatePresence>
          {(playing || (touched && !audioMissing)) && (
            <motion.p
              className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-lg font-medium tracking-wide text-white/90 sm:text-xl"
              style={{ textShadow: "0 0 24px rgba(255,255,255,0.5)" }}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {HOME.darkRoom.loveLine}
            </motion.p>
          )}
        </AnimatePresence>

        {audioMissing ? (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs text-white/40">
            {HOME.darkRoom.noAudioHint}
          </p>
        ) : null}
      </motion.div>
    </section>
  );
}
