"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import { HOME } from "@/content/site";

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
      className={`relative min-h-[340px] overflow-hidden sm:min-h-[420px] lg:min-h-[520px] ${
        entered ? "ring-2 ring-[#ff6b8b]/40 ring-offset-2 ring-offset-[#120e0c]" : ""
      }`}
    >
      <svg
        viewBox="0 0 640 480"
        className="absolute inset-0 size-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="dr-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1520" />
            <stop offset="100%" stopColor="#0e0b10" />
          </linearGradient>
          <linearGradient id="dr-floor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1c1614" />
            <stop offset="50%" stopColor="#2a221e" />
            <stop offset="100%" stopColor="#181412" />
          </linearGradient>
          <radialGradient id="dr-lamp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd89a" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#ffb347" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dr-plush-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffef8" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#fff4dc" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fff4dc" stopOpacity="0" />
          </radialGradient>
          <filter id="dr-blur-soft">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <rect width="640" height="480" fill="url(#dr-sky)" />
        <polygon points="0,320 640,320 640,480 0,480" fill="url(#dr-floor)" />

        {/* 窗外城市 */}
        <rect x="420" y="52" width="120" height="100" rx="6" fill="#0a0810" stroke="#ffffff" strokeOpacity="0.06" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={432 + (i % 3) * 28}
            y={68 + Math.floor(i / 3) * 28}
            width="10"
            height="14"
            rx="1"
            fill="#ffe8a0"
            opacity={0.15 + (i % 3) * 0.12}
          />
        ))}
        <rect x="420" y="52" width="120" height="100" fill="#6b8fc4" opacity="0.03" />

        {/* 沙发与大熊 */}
        <ellipse cx="520" cy="298" rx="88" ry="36" fill="#241e1c" />
        <rect x="448" y="268" width="144" height="44" rx="18" fill="#2e2622" />
        <ellipse cx="518" cy="256" rx="34" ry="38" fill="#3d342e" />
        <circle cx="508" cy="242" r="16" fill="#3d342e" />
        <circle cx="528" cy="242" r="16" fill="#3d342e" />
        <ellipse cx="518" cy="258" rx="12" ry="9" fill="#4a4038" />

        {/* 梳妆台与暖灯 */}
        <rect x="48" y="248" width="96" height="72" rx="6" fill="#2a221e" />
        <rect x="56" y="256" width="80" height="8" rx="2" fill="#3a302a" />
        <rect x="108" y="220" width="10" height="36" rx="3" fill="#3a302a" />
        <path d="M 113 220 Q 113 200 118 192 Q 123 186 128 192" fill="#4a4038" />
        <ellipse cx="118" cy="248" rx="70" ry="80" fill="url(#dr-lamp)" />
        <polygon points="118,248 180,320 56,320" fill="#ffb347" opacity="0.08" />

        {/* 地毯 */}
        <ellipse cx="300" cy="352" rx="130" ry="36" fill="#3d2e28" opacity="0.85" />
        <ellipse cx="300" cy="352" rx="110" ry="28" fill="#4a3830" opacity="0.5" />

        {/* 小金毛 */}
        <g>
          <ellipse cx="228" cy="328" rx="52" ry="38" fill="#d4a056" />
          <ellipse cx="208" cy="292" rx="34" ry="30" fill="#e8b86a" />
          <ellipse cx="188" cy="278" rx="16" ry="22" fill="#c9924a" transform="rotate(-18 188 278)" />
          <ellipse cx="228" cy="272" rx="16" ry="22" fill="#c9924a" transform="rotate(18 228 272)" />
          <ellipse cx="248" cy="318" rx="14" ry="20" fill="#c9924a" transform="rotate(24 248 318)" />
          <ellipse cx="198" cy="348" rx="10" ry="16" fill="#c9924a" />
          <ellipse cx="222" cy="352" rx="10" ry="16" fill="#c9924a" />
          <ellipse cx="252" cy="342" rx="10" ry="16" fill="#c9924a" />
          {/* 脸 */}
          <circle cx="200" cy="292" r="5" fill="#3d2a1a" />
          <circle cx="218" cy="292" r="5" fill="#3d2a1a" />
          <circle cx="201" cy="291" r="1.8" fill="#fff" opacity="0.7" />
          <circle cx="219" cy="291" r="1.8" fill="#fff" opacity="0.7" />
          <path d="M 204 304 Q 210 308 216 304" stroke="#8b5a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 194 284 Q 200 280 206 284" stroke="#a07030" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 212 284 Q 218 280 224 284" stroke="#a07030" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 眼泪 */}
          <motion.ellipse
            cx="198"
            cy="300"
            rx="3"
            ry="5"
            fill="#7ec8f0"
            animate={{ cy: [300, 318, 300], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="220"
            cy="300"
            rx="3"
            ry="5"
            fill="#7ec8f0"
            animate={{ cy: [300, 318, 300], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
          />
        </g>
      </svg>

      {/* 发光小白 + 拖拽 */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={HOME.darkRoom.plushAria}
        drag
        dragElastic={0.12}
        dragConstraints={{ left: -40, right: 40, top: -30, bottom: 30 }}
        style={{ x: dragX, y: dragY }}
        className="absolute left-[58%] top-[54%] z-20 cursor-grab touch-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#ff6b8b]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:left-[56%] sm:top-[52%]"
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
        <div className="relative size-[88px] sm:size-[108px]">
          <motion.div
            className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,#fffef5_0%,#ffe8b8_35%,transparent_70%)]"
            animate={{ opacity: playing ? [0.7, 1, 0.7] : [0.45, 0.65, 0.45] }}
            transition={{ duration: playing ? 0.8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <svg viewBox="0 0 100 100" className="relative size-full drop-shadow-[0_8px_24px_rgba(255,240,200,0.45)]">
            <ellipse cx="50" cy="62" rx="28" ry="32" fill="#fffef8" />
            <circle cx="50" cy="38" r="26" fill="#ffffff" />
            <ellipse cx="38" cy="34" rx="10" ry="14" fill="#fff8f0" />
            <ellipse cx="62" cy="34" rx="10" ry="14" fill="#fff8f0" />
            <circle cx="42" cy="38" r="3.5" fill="#3a2a38" opacity="0.55" />
            <circle cx="58" cy="38" r="3.5" fill="#3a2a38" opacity="0.55" />
            <ellipse cx="36" cy="46" rx="7" ry="4" fill="#ffb8c8" opacity="0.45" />
            <ellipse cx="64" cy="46" rx="7" ry="4" fill="#ffb8c8" opacity="0.45" />
            <ellipse cx="28" cy="58" rx="9" ry="12" fill="#fff8f0" />
            <ellipse cx="72" cy="58" rx="9" ry="12" fill="#fff8f0" />
          </svg>
        </div>
      </motion.div>

      {/* 粉色气泡 */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            className="pointer-events-none absolute left-[68%] top-[38%] z-30 sm:left-[66%] sm:top-[36%]"
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
          className="pointer-events-none absolute left-[48%] top-[58%] z-10 flex items-center gap-2 sm:left-[46%] sm:top-[56%]"
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
          className="pointer-events-none absolute left-[62%] top-[62%] z-30 text-white/80 sm:left-[60%] sm:top-[60%]"
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
