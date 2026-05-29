"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import { HOME } from "@/content/site";

import { DarkRoomIllustration } from "./DarkRoomIllustration";
import { PlushDoll } from "./PlushDoll";

const DEFAULT_AUDIO = "/audio/iloveyou-voice.mp3";
const PINK = "#ff6b8b";

function audioSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DARK_ROOM_AUDIO_URL?.trim();
  return fromEnv || DEFAULT_AUDIO;
}

function HandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9 11V5.5A1.5 1.5 0 0 1 10.5 4h.25A1.25 1.25 0 0 1 12 5.25V11h1V7.5A1.5 1.5 0 0 1 14.5 6h.25A1.25 1.25 0 0 1 16 7.25V11h1V8.75A1.25 1.25 0 0 1 18.25 7.5h.25A1.25 1.25 0 0 1 19.75 8.75V14a5.25 5.25 0 0 1-5.25 5.25h-2A5.25 5.25 0 0 1 7.25 14V12.5A1.25 1.25 0 0 1 8.5 11.25h.25A1.25 1.25 0 0 1 10 12.5V11H9Z" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
      {muted ? (
        <>
          <path d="M9.5 4.5 6 8H3.5A1 1 0 0 0 2.5 9v2a1 1 0 0 0 1 1H6l3.5 3.5V4.5Z" />
          <path d="m13.5 7.5 2 2m0 0 2 2m-2-2 2-2m-2 2-2 2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M9.5 4.5 6 8H3.5A1 1 0 0 0 2.5 9v2a1 1 0 0 0 1 1H6l3.5 3.5V4.5Z" />
          <path d="M12.5 7.5a3.5 3.5 0 0 1 0 5M14.5 5.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

type DarkRoomSceneProps = {
  entered: boolean;
  muted: boolean;
  playing: boolean;
  showBubble: boolean;
  clickCount: number;
  audioMissing: boolean;
  onPlushInteract: () => void;
};

function DarkRoomScene({
  entered,
  muted,
  playing,
  showBubble,
  clickCount,
  audioMissing,
  onPlushInteract,
}: DarkRoomSceneProps) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const draggedRef = useRef(false);

  return (
    <div
      className={`relative min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-[540px] ${
        entered ? "ring-2 ring-[#ff6b8b]/40 ring-offset-2 ring-offset-[#120e0c]" : ""
      }`}
    >
      <DarkRoomIllustration comforted={playing || showBubble} />

      {/* 发光小白 + 拖拽 */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={HOME.darkRoom.plushAria}
        drag
        dragElastic={0.12}
        dragConstraints={{ left: -48, right: 48, top: -36, bottom: 36 }}
        style={{ x: dragX, y: dragY }}
        className="absolute left-[54%] top-[58%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#ff6b8b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:left-[56%] sm:top-[56%]"
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={() => {
          if (draggedRef.current) {
            draggedRef.current = false;
            onPlushInteract();
          }
        }}
        onClick={() => {
          if (!draggedRef.current) onPlushInteract();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPlushInteract();
          }
        }}
        animate={
          playing
            ? { scale: [1, 1.08, 1.04, 1.08, 1] }
            : { scale: [1, 1.03, 1] }
        }
        transition={
          playing
            ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="relative size-[96px] sm:size-[118px]">
          <motion.div
            className="absolute inset-[-45%] rounded-full bg-[radial-gradient(circle,#fffef8_0%,#ffe8b8_30%,transparent_68%)]"
            animate={{ opacity: playing ? [0.75, 1, 0.75] : [0.5, 0.72, 0.5] }}
            transition={{ duration: playing ? 0.8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,transparent_70%)]"
            animate={{ scale: playing ? [1, 1.12, 1] : [1, 1.06, 1] }}
            transition={{ duration: playing ? 0.9 : 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <PlushDoll playing={playing} />
        </div>
      </motion.div>

      {/* 粉色气泡 */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            className="pointer-events-none absolute left-[64%] top-[34%] z-30 -translate-x-1/2 sm:left-[62%] sm:top-[32%]"
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 6 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <div
              className="relative rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(255,107,139,0.55)] sm:text-base"
              style={{
                background: `linear-gradient(135deg, ${PINK} 0%, #ff8fa8 100%)`,
              }}
            >
              {HOME.darkRoom.loveLine} ♥
              <span
                className="absolute -bottom-2 left-4 size-0 border-x-8 border-t-8 border-x-transparent"
                style={{ borderTopColor: PINK }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 虚线引导 + 手型光标 */}
      {!showBubble && clickCount < 2 && (
        <motion.div
          className="pointer-events-none absolute left-[44%] top-[60%] z-10 flex items-center gap-2 sm:left-[42%] sm:top-[58%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <svg width="80" height="40" className="text-white/35" aria-hidden>
            <path
              d="M 4 20 Q 40 8 76 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>
          <span className="whitespace-nowrap text-xs text-white/50 sm:text-sm">
            {HOME.darkRoom.dragHint}
          </span>
        </motion.div>
      )}

      {clickCount < 1 && (
        <motion.div
          className="pointer-events-none absolute left-[58%] top-[64%] z-30 text-white/80 sm:left-[56%] sm:top-[62%]"
          animate={{ x: [0, 6, 0], y: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <HandIcon className="size-7 drop-shadow-lg sm:size-8" />
        </motion.div>
      )}

      {/* 小提示 */}
      <div className="absolute bottom-4 right-4 z-20 max-w-[180px] rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-[11px] leading-snug text-white/55 backdrop-blur-sm sm:text-xs">
        {HOME.darkRoom.tip}
      </div>

      {audioMissing && !muted && (
        <p className="absolute bottom-4 left-4 z-20 max-w-[200px] text-[10px] text-white/35 sm:text-xs">
          {HOME.darkRoom.noAudioHint}
        </p>
      )}
    </div>
  );
}

/** 小金毛秘密房间 — 参考设计稿：左文案右暗室插画，触碰发光小白播放 I love you */
export function DarkRoomSection() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [audioMissing, setAudioMissing] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const playLove = useCallback(async () => {
    setClickCount((c) => c + 1);
    setShowBubble(true);
    window.setTimeout(() => setShowBubble(false), 2800);

    if (muted) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc());
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;
    audio.muted = muted;
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
  }, [muted]);

  const enterRoom = () => {
    setEntered(true);
    sceneRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <motion.div
        ref={sceneRef}
        className="overflow-hidden rounded-[28px] shadow-[0_32px_100px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] sm:rounded-[36px]"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {/* 左侧文案 */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-[#fff9fb] via-white to-[#fff5f7] px-7 py-10 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: PINK }}
            >
              {HOME.darkRoom.title}
            </h2>
            <p className="mt-3 text-base text-[var(--mute)] sm:text-lg">
              {HOME.darkRoom.subtitle}
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--foreground)]/75 sm:text-[15px]">
              {HOME.darkRoom.description}
            </p>

            <ul className="mt-8 space-y-5">
              {HOME.darkRoom.features.map((f, i) => (
                <li key={f.title} className="flex gap-4">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(135deg, #ff6b8b, #ff8fa8)"
                          : "linear-gradient(135deg, #ffb347, #ffd699)",
                    }}
                  >
                    {i === 0 ? (
                      <HandIcon className="size-5" />
                    ) : (
                      <SpeakerIcon muted={false} />
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{f.title}</p>
                    <p className="mt-0.5 text-sm text-[var(--mute)]">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={enterRoom}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(255,107,139,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${PINK}, #ff8fa8)` }}
              >
                ♥ {HOME.darkRoom.enterRoom}
              </button>
              <button
                type="button"
                onClick={() => setShowLearnMore((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--foreground)]/10 bg-white/80 px-6 py-3 text-sm font-medium text-[var(--foreground)]/80 transition-colors hover:bg-white"
              >
                ▷ {HOME.darkRoom.learnMore}
              </button>
            </div>

            <AnimatePresence>
              {showLearnMore && (
                <motion.p
                  className="mt-4 max-w-md text-xs leading-relaxed text-[var(--mute)] sm:text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {HOME.darkRoom.learnMoreBody}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* 右侧暗室场景 */}
          <div className="relative bg-[#120e0c]">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="absolute right-4 top-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white/75 backdrop-blur-md transition-colors hover:bg-black/55 sm:text-sm"
              aria-pressed={muted}
            >
              <SpeakerIcon muted={muted} />
              {muted ? HOME.darkRoom.soundOff : HOME.darkRoom.soundOn}
            </button>

            <DarkRoomScene
              entered={entered}
              muted={muted}
              playing={playing}
              showBubble={showBubble}
              clickCount={clickCount}
              audioMissing={audioMissing}
              onPlushInteract={() => void playLove()}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
