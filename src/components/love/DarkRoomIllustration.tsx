"use client";

import { motion } from "framer-motion";

type DarkRoomIllustrationProps = {
  /** 播放 I love you 时小金毛稍微缓和 */
  comforted?: boolean;
};

/** 暗室精细插画 — 原创 SVG，暖灯、夜景、小金毛与房间细节 */
export function DarkRoomIllustration({ comforted = false }: DarkRoomIllustrationProps) {
  return (
    <svg
      viewBox="0 0 800 560"
      className="absolute inset-0 size-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="dr-wall-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141018" />
          <stop offset="55%" stopColor="#100d12" />
          <stop offset="100%" stopColor="#0a080c" />
        </linearGradient>
        <linearGradient id="dr-wall-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0c0a0e" />
          <stop offset="100%" stopColor="#16121a" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="dr-floor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#181412" />
          <stop offset="35%" stopColor="#2a221c" />
          <stop offset="100%" stopColor="#151210" />
        </linearGradient>
        <linearGradient id="dr-floor-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="dr-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.75" />
          <stop offset="30%" stopColor="#ffc870" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ff9f43" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dr-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eef4ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6b8fc4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dr-dog-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0c878" />
          <stop offset="100%" stopColor="#c9924a" />
        </linearGradient>
        <linearGradient id="dr-dog-ear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8b868" />
          <stop offset="100%" stopColor="#a87838" />
        </linearGradient>
        <linearGradient id="dr-dog-snout" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d898" />
          <stop offset="100%" stopColor="#ddb060" />
        </linearGradient>
        <filter id="dr-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* 背景墙 */}
      <rect width="800" height="560" fill="url(#dr-wall-back)" />
      <polygon points="0,0 220,0 220,380 0,380" fill="url(#dr-wall-left)" />
      <rect x="0" y="368" width="800" height="8" fill="#0e0c10" opacity="0.8" />

      {/* 地板 */}
      <polygon points="0,376 800,376 800,560 0,560" fill="url(#dr-floor)" />
      <polygon points="0,376 800,376 800,392 0,392" fill="url(#dr-floor-shine)" />
      {/* 地板木纹暗示 */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={i * 110 - 20}
          y1="390"
          x2={i * 110 + 40}
          y2="556"
          stroke="#ffffff"
          strokeOpacity="0.018"
          strokeWidth="1"
        />
      ))}

      {/* 窗外 — 窗帘 + 城市夜景 */}
      <g>
        <rect x="528" y="44" width="148" height="128" rx="8" fill="#08060c" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1.5" />
        {/* 窗帘 */}
        <path d="M528 52 Q560 90 528 168" fill="#1a1420" opacity="0.85" />
        <path d="M676 52 Q644 90 676 168" fill="#1a1420" opacity="0.85" />
        <rect x="598" y="44" width="8" height="128" fill="#2a2228" opacity="0.5" />
        {/* 月亮 */}
        <circle cx="620" cy="78" r="14" fill="#eef4ff" opacity="0.35" filter="url(#dr-soft-blur)" />
        <circle cx="620" cy="78" r="10" fill="#f8fbff" opacity="0.55" />
        {/* 城市天际线 */}
        <path
          d="M536 148 L536 118 L548 118 L548 108 L562 108 L562 128 L578 128 L578 98 L592 98 L592 118 L608 118 L608 104 L624 104 L624 130 L640 130 L640 112 L656 112 L656 138 L672 138 L672 148 Z"
          fill="#0e0c14"
        />
        {/* 亮窗 */}
        {[
          [552, 118], [568, 108], [586, 102], [602, 118], [618, 112], [638, 118], [654, 122],
          [548, 132], [572, 136], [596, 128], [614, 134], [636, 130], [658, 132],
        ].map(([x, y], i) => (
          <rect
            key={`win-${i}`}
            x={x}
            y={y}
            width="8"
            height="10"
            rx="1"
            fill={i % 4 === 0 ? "#ffe8a8" : "#ffd080"}
            opacity={0.12 + (i % 5) * 0.08}
          />
        ))}
        <rect x="528" y="44" width="148" height="128" fill="#6b8fc4" opacity="0.035" rx="8" />
      </g>

      {/* 沙发 + 大熊 */}
      <g>
        <ellipse cx="598" cy="348" rx="108" ry="28" fill="#0a0808" opacity="0.45" />
        <path d="M488 318 Q488 292 518 286 L678 286 Q708 292 708 318 L708 348 Q708 368 688 372 L508 372 Q488 368 488 348 Z" fill="#2a2220" />
        <path d="M498 298 Q518 284 548 284 L648 284 Q678 284 698 298 L698 312 L498 312 Z" fill="#342c28" />
        {/* 靠垫缝线 */}
        <path d="M540 300 Q598 308 656 300" stroke="#4a4038" strokeWidth="1" fill="none" opacity="0.5" />
        <ellipse cx="528" cy="332" rx="28" ry="36" fill="#2e2622" />
        <ellipse cx="668" cy="332" rx="28" ry="36" fill="#2e2622" />
        {/* 泰迪熊 */}
        <ellipse cx="612" cy="302" rx="38" ry="42" fill="#5c4a3a" />
        <circle cx="592" cy="268" r="22" fill="#5c4a3a" />
        <circle cx="632" cy="268" r="22" fill="#5c4a3a" />
        <ellipse cx="612" cy="278" rx="26" ry="24" fill="#6b5848" />
        <circle cx="602" cy="274" r="4" fill="#2a2018" />
        <circle cx="622" cy="274" r="4" fill="#2a2018" />
        <ellipse cx="612" cy="286" rx="10" ry="7" fill="#4a3828" />
        <path d="M592 248 Q612 238 632 248" stroke="#8b2840" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="612" cy="246" r="5" fill="#c04058" />
      </g>

      {/* 梳妆台 + 暖灯 */}
      <g>
        <ellipse cx="118" cy="348" rx="72" ry="16" fill="#0a0808" opacity="0.4" />
        <rect x="52" y="288" width="132" height="68" rx="8" fill="#2a221e" />
        <rect x="60" y="296" width="116" height="10" rx="3" fill="#3a3028" />
        {/* 抽屉 */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="64" y={312 + i * 14} width="108" height="10" rx="2" fill="#342c26" />
            <rect x="112" y={315 + i * 14} width="12" height="4" rx="2" fill="#5a4a40" opacity="0.6" />
          </g>
        ))}
        {/* 相框 */}
        <rect x="148" y="268" width="28" height="22" rx="2" fill="#3a3028" stroke="#5a4a40" strokeWidth="1" />
        <rect x="152" y="272" width="20" height="14" rx="1" fill="#4a6070" opacity="0.5" />
        {/* 台灯 */}
        <rect x="78" y="248" width="8" height="44" rx="2" fill="#4a4038" />
        <path d="M72 248 Q82 228 92 248 L88 256 L76 256 Z" fill="#f5e6c8" opacity="0.9" />
        <ellipse cx="82" cy="256" rx="22" ry="8" fill="#fff8e8" opacity="0.85" />
        <circle cx="82" cy="268" r="6" fill="#ffe8a0" opacity="0.95" />
        {/* 暖光 */}
        <ellipse cx="82" cy="300" rx="120" ry="130" fill="url(#dr-lamp-glow)" />
        <polygon points="82,300 220,376 0,376" fill="#ffb347" opacity="0.07" />
        {/* 灯照尘埃 */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <motion.circle
            key={`dust-${i}`}
            cx={60 + i * 18}
            cy={280 + (i % 3) * 24}
            r={1.2 + (i % 2) * 0.6}
            fill="#ffe8b0"
            opacity="0.35"
            animate={{ y: [0, -8, 0], opacity: [0.15, 0.45, 0.15] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
          />
        ))}
      </g>

      {/* 地毯 */}
      <ellipse cx="340" cy="418" rx="168" ry="44" fill="#3a2a24" opacity="0.9" />
      <ellipse cx="340" cy="418" rx="148" ry="36" fill="#4a3830" opacity="0.55" />
      <ellipse cx="340" cy="418" rx="128" ry="28" fill="none" stroke="#6a5048" strokeWidth="2" opacity="0.35" />
      <ellipse cx="340" cy="418" rx="108" ry="22" fill="none" stroke="#6a5048" strokeWidth="1" opacity="0.2" />
      {/* 地毯纹理 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <ellipse
          key={`rug-${i}`}
          cx={240 + i * 22}
          cy={418 + Math.sin(i) * 4}
          rx="8"
          ry="3"
          fill="#5a4038"
          opacity="0.15"
        />
      ))}

      {/* 小金毛 — 精细版 */}
      <g>
        {/* 投影 */}
        <ellipse cx="268" cy="438" rx="72" ry="18" fill="#000" opacity="0.25" />
        {/* 尾巴 */}
        <path
          d="M 318 388 Q 358 368 372 328 Q 378 308 368 292"
          fill="url(#dr-dog-body)"
          stroke="#a87838"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        {/* 身体 */}
        <ellipse cx="268" cy="398" rx="68" ry="52" fill="url(#dr-dog-body)" />
        <ellipse cx="248" cy="378" rx="48" ry="38" fill="#e8c070" opacity="0.35" />
        {/* 后腿 */}
        <ellipse cx="308" cy="418" rx="18" ry="28" fill="#c9924a" />
        <ellipse cx="328" cy="412" rx="16" ry="24" fill="#b88440" />
        {/* 前腿 */}
        <ellipse cx="228" cy="424" rx="14" ry="22" fill="#c9924a" />
        <ellipse cx="252" cy="428" rx="14" ry="22" fill="#c9924a" />
        <ellipse cx="240" cy="432" rx="10" ry="8" fill="#ddb868" opacity="0.5" />
        {/* 胸部绒毛 */}
        <ellipse cx="248" cy="392" rx="32" ry="28" fill="#f0d080" opacity="0.45" />
        {/* 头 */}
        <ellipse cx="228" cy="338" rx="44" ry="40" fill="url(#dr-dog-body)" />
        {/* 耳朵 */}
        <ellipse cx="196" cy="318" rx="18" ry="28" fill="url(#dr-dog-ear)" transform="rotate(-22 196 318)" />
        <ellipse cx="196" cy="318" rx="10" ry="18" fill="#f0c888" opacity="0.45" transform="rotate(-22 196 318)" />
        <ellipse cx="260" cy="312" rx="18" ry="28" fill="url(#dr-dog-ear)" transform="rotate(18 260 312)" />
        <ellipse cx="260" cy="312" rx="10" ry="18" fill="#f0c888" opacity="0.45" transform="rotate(18 260 312)" />
        {/* 口鼻 */}
        <ellipse cx="228" cy="352" rx="22" ry="18" fill="url(#dr-dog-snout)" />
        <ellipse cx="228" cy="362" rx="12" ry="9" fill="#f5e0a8" />
        <ellipse cx="228" cy="360" rx="7" ry="5" fill="#3a2820" />
        <ellipse cx="226" cy="359" rx="2" ry="1.5" fill="#ffffff" opacity="0.35" />
        {/* 眼睛 — 大而有神 */}
        <ellipse cx="212" cy="332" rx="10" ry="11" fill="#ffffff" opacity="0.95" />
        <ellipse cx="244" cy="332" rx="10" ry="11" fill="#ffffff" opacity="0.95" />
        <circle cx="214" cy="334" r="6" fill="#3a2818" />
        <circle cx="246" cy="334" r="6" fill="#3a2818" />
        <circle cx="216" cy="332" r="2.2" fill="#ffffff" opacity="0.9" />
        <circle cx="248" cy="332" r="2.2" fill="#ffffff" opacity="0.9" />
        {/* 委屈眉 */}
        <path d="M200 322 Q208 316 216 320" stroke="#a87838" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M240 320 Q248 316 256 322" stroke="#a87838" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 嘴 — 委屈 */}
        <path d="M218 368 Q228 374 238 368" stroke="#8b6030" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 眼泪 */}
        <motion.g animate={{ opacity: comforted ? 0.35 : 1 }} transition={{ duration: 0.8 }}>
          <motion.path
            d="M208 342 Q206 358 204 374"
            stroke="#8ec8f0"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
            animate={{ pathLength: [0.3, 1, 0.3], opacity: [0.3, 0.85, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M252 342 Q254 360 256 378"
            stroke="#8ec8f0"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
            animate={{ pathLength: [0.3, 1, 0.3], opacity: [0.3, 0.85, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
          />
          <motion.circle
            cx="208"
            cy="346"
            r="3.5"
            fill="#a8d8f8"
            animate={{ cy: [346, 368, 346], opacity: [0.4, 0.95, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx="252"
            cy="346"
            r="3.5"
            fill="#a8d8f8"
            animate={{ cy: [346, 368, 346], opacity: [0.4, 0.95, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
          />
        </motion.g>
      </g>

      {/* 小白光晕底（玩偶本体外置 HTML 层） */}
      <ellipse cx="478" cy="392" rx="64" ry="72" fill="url(#dr-lamp-glow)" opacity="0.15" />
      <ellipse cx="478" cy="392" rx="48" ry="54" fill="#fffef5" opacity="0.08" />
    </svg>
  );
}
