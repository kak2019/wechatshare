"use client";

import type { PersonalityDef, Stats, StatKey } from "@/lib/soviet-vn/types";
import { STAT_LABELS } from "@/lib/soviet-vn/types";

type PersonalityResultProps = {
  personality: PersonalityDef;
  stats: Stats;
  onBack: () => void;
};

const STAT_KEYS: StatKey[] = [
  "authority",
  "reform",
  "integrity",
  "welfare",
  "diplomacy",
  "idealism",
];

function radarPoints(stats: Stats, cx: number, cy: number, r: number): string {
  const keys = STAT_KEYS;
  return keys
    .map((key, i) => {
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const dist = (stats[key] / 100) * r;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      return `${x},${y}`;
    })
    .join(" ");
}

function axisPoints(cx: number, cy: number, r: number, count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    return `${x},${y}`;
  }).join(" ");
}

export function PersonalityResult({
  personality,
  stats,
  onBack,
}: PersonalityResultProps) {
  const cx = 120;
  const cy = 120;
  const maxR = 90;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-8">
      <p className="text-xs tracking-[0.35em] text-[#c41e3a]/70 uppercase">
        六维人格
      </p>
      <h2 className="mt-3 text-center text-2xl font-semibold text-[#f5e9d4] sm:text-3xl">
        {personality.name}
      </h2>
      <p className="mt-1 text-center text-sm text-[#ffd700]/80">
        {personality.epithet}
      </p>
      <p className="mt-4 max-w-md text-center leading-relaxed text-[#d4c4a8]/90">
        {personality.description}
      </p>

      <svg
        viewBox="0 0 240 240"
        className="mt-8 h-56 w-56 sm:h-64 sm:w-64"
        aria-label="六维雷达图"
      >
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={axisPoints(cx, cy, maxR * scale, 6)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {STAT_KEYS.map((key, i) => {
          const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
          const x = cx + Math.cos(angle) * maxR;
          const y = cy + Math.sin(angle) * maxR;
          const lx = cx + Math.cos(angle) * (maxR + 18);
          const ly = cy + Math.sin(angle) * (maxR + 18);
          return (
            <g key={key}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="rgba(196,30,58,0.25)"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(245,233,212,0.7)"
                fontSize="10"
              >
                {STAT_LABELS[key]}
              </text>
            </g>
          );
        })}

        <polygon
          points={radarPoints(stats, cx, cy, maxR)}
          fill="rgba(196,30,58,0.25)"
          stroke="#c41e3a"
          strokeWidth="2"
        />
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/50 sm:grid-cols-6">
        {STAT_KEYS.map((key) => (
          <div key={key}>
            <span className="block text-[#c41e3a]">{stats[key]}</span>
            {STAT_LABELS[key]}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-8 rounded-lg bg-[#c41e3a] px-6 py-2.5 text-sm text-white"
      >
        返回
      </button>
    </div>
  );
}
