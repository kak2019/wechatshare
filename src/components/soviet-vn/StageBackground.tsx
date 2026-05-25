"use client";

import { motion } from "framer-motion";

import type { SceneId } from "@/lib/soviet-vn/types";

const SCENE_STYLES: Record<
  SceneId,
  { gradient: string; label: string; accent: string }
> = {
  kremlin: {
    gradient:
      "radial-gradient(ellipse at 50% 20%, #5c1a1a 0%, #1a0a0a 45%, #0d0808 100%)",
    label: "莫斯科 · 克里姆林宫侧翼",
    accent: "#c41e3a",
  },
  sochi: {
    gradient:
      "radial-gradient(ellipse at 70% 30%, #1a4a5c 0%, #0a1a22 50%, #050810 100%)",
    label: "黑海 · 索契奥运工地",
    accent: "#4a9eff",
  },
  fishing_port: {
    gradient:
      "radial-gradient(ellipse at 30% 60%, #1a3a2a 0%, #0a1410 55%, #050808 100%)",
    label: "远东 · 渔业联合企业",
    accent: "#6abf8a",
  },
  office: {
    gradient:
      "radial-gradient(ellipse at 50% 40%, #2a2218 0%, #12100c 60%, #080604 100%)",
    label: "莫斯科 · 部长会议办公室",
    accent: "#d4a853",
  },
  dream: {
    gradient:
      "radial-gradient(ellipse at 50% 50%, #8b1a1a 0%, #4a1020 40%, #1a0810 100%)",
    label: "乌托邦 · 红色梦境",
    accent: "#ff6b6b",
  },
  dissolve: {
    gradient:
      "radial-gradient(ellipse at 50% 80%, #1a1a2e 0%, #0a0a12 50%, #000000 100%)",
    label: "1991 · 联盟终结",
    accent: "#888899",
  },
};

type StageBackgroundProps = {
  scene: SceneId;
};

export function StageBackground({ scene }: StageBackgroundProps) {
  const style = SCENE_STYLES[scene];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        key={scene}
        className="absolute inset-0"
        style={{ background: style.gradient }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      {/* 原子之心风几何放射线 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, ${style.accent} 0deg 2deg, transparent 2deg 18deg)`,
        }}
      />

      {/* CRT 扫描线 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
        }}
      />

      {/* 锤镰 silhouette */}
      <svg
        className="pointer-events-none absolute left-1/2 top-[18%] h-32 w-32 -translate-x-1/2 opacity-[0.06] sm:h-48 sm:w-48"
        viewBox="0 0 100 100"
        fill={style.accent}
        aria-hidden
      >
        <path d="M48 15 L52 15 L52 42 L68 42 L68 38 L78 48 L68 58 L68 54 L52 54 L52 85 L48 85 L48 54 L32 54 L32 58 L22 48 L32 38 L32 42 L48 42 Z" />
        <path d="M55 55 C70 55 82 67 82 82 C82 90 76 96 68 96 L38 96 C30 96 24 90 24 82 C24 67 36 55 51 55 Z" />
      </svg>

      <div className="pointer-events-none absolute left-4 top-4 rounded border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/50 backdrop-blur-sm sm:text-xs">
        {style.label}
      </div>
    </div>
  );
}
