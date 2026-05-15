"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Heart = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  emoji: string;
};

const HEART_EMOJIS = ["❤", "💖", "💗", "💝", "💕", "✨", "🌟"];

/**
 * 全站彩蛋：
 *  1. 双击页面任意位置 → 该位置爱心烟花
 *  2. 右下角小月亮按钮：日 / 夜模式切换，并持久化到 localStorage
 *     22:00 - 06:00 默认进入夜间模式
 */
export function GlobalEasterEggs() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [night, setNight] = useState<boolean | null>(null);

  // 仅在挂载后异步初始化夜间模式（避免水合错位 & 在 effect 中同步 setState）
  useEffect(() => {
    const handle = window.setTimeout(() => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem("theme:night");
      } catch {
        /* ignore */
      }
      let isNight = false;
      if (saved === "1") isNight = true;
      else if (saved === "0") isNight = false;
      else {
        const h = new Date().getHours();
        isNight = h >= 22 || h < 6;
      }
      document.documentElement.dataset.night = String(isNight);
      setNight(isNight);
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (night !== null) {
      document.documentElement.dataset.night = String(night);
    }
  }, [night]);

  const toggleNight = useCallback(() => {
    setNight((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("theme:night", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // 双击爱心烟花
  useEffect(() => {
    function onDouble(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      const now = Date.now();
      const next: Heart[] = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 60 + Math.random() * 40;
        return {
          id: now + i,
          x,
          y,
          dx: Math.cos(angle) * r,
          dy: Math.sin(angle) * r - 30,
          rot: (Math.random() - 0.5) * 90,
          emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
        };
      });
      setHearts((prev) => [...prev, ...next]);
      window.setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id >= now + 12));
      }, 1400);
    }
    window.addEventListener("dblclick", onDouble);
    return () => window.removeEventListener("dblclick", onDouble);
  }, []);

  return (
    <>
      {/* 爱心粒子层（fixed，不影响布局） */}
      <div className="pointer-events-none fixed inset-0 z-[60]">
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.span
              key={h.id}
              className="absolute select-none text-xl"
              style={{ left: h.x, top: h.y }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
              animate={{
                opacity: 0,
                x: h.dx,
                y: h.dy,
                scale: 1.25,
                rotate: h.rot,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {h.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* 夜间模式切换按钮 */}
      <button
        type="button"
        onClick={toggleNight}
        aria-label={night ? "切换到日间模式" : "切换到夜间模式"}
        className="fixed bottom-6 right-6 z-[55] grid h-12 w-12 place-items-center rounded-full text-lg shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.06] backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        style={{
          background: night ? "rgba(29,24,34,0.85)" : "rgba(255,255,255,0.85)",
          color: night ? "#f5e9d4" : "#1d1d1f",
        }}
      >
        <motion.span
          key={night ? "moon" : "sun"}
          initial={{ scale: 0.6, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          {night ? "🌙" : "☀️"}
        </motion.span>
      </button>

      {/* 夜间模式下页面背景的星星层 */}
      {night ? <StarryBackdrop /> : null}
    </>
  );
}

type Star = {
  id: number;
  left: number;
  top: number;
  delay: number;
  size: number;
};

function StarryBackdrop() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setStars(
        Array.from({ length: 36 }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 4,
          size: 2 + Math.random() * 2,
        })),
      );
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-amber-100"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.4,
            animation: `star-twinkle 4s ease-in-out ${s.delay}s infinite`,
            boxShadow: "0 0 8px rgba(255, 222, 173, 0.6)",
          }}
        />
      ))}
    </div>
  );
}
