"use client";

import { motion } from "framer-motion";

/** 原创简约插画：圆滚滚的「布布系」双人轮廓 + 线条小狗，避免使用官方表情包素材 */

export function CoupleBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-[8%] top-[18%] h-56 w-56 sm:h-72 sm:w-72"
        animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 200" className="size-full drop-shadow-[0_20px_50px_rgba(255,196,0,0.35)]">
          <defs>
            <linearGradient id="blobA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe08a" />
              <stop offset="100%" stopColor="#ffc93c" />
            </linearGradient>
          </defs>
          <ellipse cx="92" cy="118" rx="58" ry="64" fill="url(#blobA)" />
          <ellipse cx="68" cy="68" rx="22" ry="20" fill="url(#blobA)" />
          <ellipse cx="112" cy="64" rx="22" ry="20" fill="url(#blobA)" />
          <circle cx="78" cy="108" r="6" fill="#3a2f2a" />
          <circle cx="106" cy="108" r="6" fill="#3a2f2a" />
          <path
            d="M86 128 Q102 136 118 128"
            fill="none"
            stroke="#3a2f2a"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[-6%] top-[26%] h-52 w-52 sm:h-64 sm:w-64"
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <svg viewBox="0 0 200 200" className="size-full drop-shadow-[0_18px_40px_rgba(255,183,77,0.35)]">
          <defs>
            <linearGradient id="blobB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd666" />
              <stop offset="100%" stopColor="#ff9f43" />
            </linearGradient>
          </defs>
          <ellipse cx="108" cy="120" rx="52" ry="58" fill="url(#blobB)" />
          <ellipse cx="86" cy="72" rx="20" ry="18" fill="url(#blobB)" />
          <ellipse cx="128" cy="70" rx="20" ry="18" fill="url(#blobB)" />
          <circle cx="94" cy="112" r="5" fill="#2b2420" />
          <circle cx="118" cy="112" r="5" fill="#2b2420" />
          <path
            d="M98 130 Q112 138 128 128"
            fill="none"
            stroke="#2b2420"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function LineDogOutline() {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[6%] left-1/2 w-[min(340px,85vw)] -translate-x-1/2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <svg viewBox="0 0 400 120" className="w-full" fill="none">
        <motion.path
          d="M52 78c18-22 46-34 78-34 22 0 40 6 54 16 10-26 34-44 62-44 34 0 62 26 68 60 18 4 30 18 30 36 0 22-18 40-40 40H74c-28 0-52-22-56-50-1-6-1-12 0-18 2-12 12-22 34-10z"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#1d1d1f]/35"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.circle
          cx="128"
          cy="48"
          r="5"
          className="fill-[#1d1d1f]/40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 320, damping: 18 }}
        />
        <motion.circle
          cx="158"
          cy="44"
          r="5"
          className="fill-[#1d1d1f]/40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.72, type: "spring", stiffness: 320, damping: 18 }}
        />
        <motion.path
          d="M136 64c8 6 16 6 24 0"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="text-[#1d1d1f]/40"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.9, duration: 0.5 }}
        />
      </svg>
    </motion.div>
  );
}
