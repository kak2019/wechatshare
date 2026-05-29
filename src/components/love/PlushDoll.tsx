"use client";

import { motion } from "framer-motion";

type PlushDollProps = {
  playing: boolean;
};

/** 精细发光小白玩偶 SVG */
export function PlushDoll({ playing }: PlushDollProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="relative size-full drop-shadow-[0_10px_32px_rgba(255,235,200,0.55)]"
      aria-hidden
    >
      <defs>
        <radialGradient id="plush-body" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#fff8f0" />
          <stop offset="100%" stopColor="#f0e8e0" />
        </radialGradient>
        <radialGradient id="plush-head" cx="45%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#faf6ff" />
          <stop offset="100%" stopColor="#ece4dc" />
        </radialGradient>
        <linearGradient id="plush-ear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffaf5" />
          <stop offset="100%" stopColor="#f5ebe0" />
        </linearGradient>
      </defs>

      {/* 外圈柔光 */}
      <ellipse cx="60" cy="64" rx="52" ry="54" fill="#fffef8" opacity={playing ? 0.35 : 0.18} />

      {/* 身体 */}
      <ellipse cx="60" cy="78" rx="32" ry="36" fill="url(#plush-body)" />
      <path d="M44 68 Q60 58 76 68" stroke="#f0e8e0" strokeWidth="1.5" fill="none" opacity="0.6" />

      {/* 头 */}
      <circle cx="60" cy="46" r="30" fill="url(#plush-head)" />
      {/* 耳朵 */}
      <ellipse cx="38" cy="38" rx="12" ry="18" fill="url(#plush-ear)" transform="rotate(-15 38 38)" />
      <ellipse cx="82" cy="38" rx="12" ry="18" fill="url(#plush-ear)" transform="rotate(15 82 38)" />
      <ellipse cx="38" cy="38" rx="7" ry="12" fill="#ffe8f0" opacity="0.45" transform="rotate(-15 38 38)" />
      <ellipse cx="82" cy="38" rx="7" ry="12" fill="#ffe8f0" opacity="0.45" transform="rotate(15 82 38)" />

      {/* 高光 */}
      <ellipse cx="48" cy="36" rx="10" ry="6" fill="#ffffff" opacity="0.55" />
      <ellipse cx="72" cy="40" rx="6" ry="4" fill="#ffffff" opacity="0.3" />

      {/* 眼睛 */}
      <ellipse cx="50" cy="46" rx="4.5" ry="5" fill="#3a2838" opacity="0.65" />
      <ellipse cx="70" cy="46" rx="4.5" ry="5" fill="#3a2838" opacity="0.65" />
      <circle cx="51" cy="45" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="71" cy="45" r="1.5" fill="#ffffff" opacity="0.8" />

      {/* 腮红 */}
      <ellipse cx="42" cy="54" rx="8" ry="4.5" fill="#ffb8c8" opacity="0.4" />
      <ellipse cx="78" cy="54" rx="8" ry="4.5" fill="#ffb8c8" opacity="0.4" />

      {/* 嘴 */}
      <path d="M56 56 Q60 60 64 56" stroke="#e8b0b8" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* 小手 */}
      <ellipse cx="32" cy="72" rx="11" ry="14" fill="#fff8f0" />
      <ellipse cx="88" cy="72" rx="11" ry="14" fill="#fff8f0" />
      {/* 缝线细节 */}
      <path d="M32 66 L32 78" stroke="#e8dcd0" strokeWidth="0.8" opacity="0.5" />
      <path d="M88 66 L88 78" stroke="#e8dcd0" strokeWidth="0.8" opacity="0.5" />
      <path d="M52 82 Q60 86 68 82" stroke="#e8dcd0" strokeWidth="0.8" fill="none" opacity="0.4" />
    </svg>
  );
}
