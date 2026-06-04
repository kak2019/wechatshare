"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { TuanziAvatarSvg } from "@/components/tuanzi/TuanziAvatarSvg";

export type BubbleMessage = {
  id: string;
  roleId: string;
  roleName: string;
  modelLabel: string;
  avatar?: string;
  accent?: string;
  phase: string;
  round: number;
  content: string;
  streaming?: boolean;
  isHost?: boolean;
  isEvidence?: boolean;
};

function phaseLabel(phase: string, round: number): string {
  if (phase === "evidence") return "联网资料";
  if (phase === "host_open") return "开场";
  if (phase === "minutes") return "会议纪要";
  if (phase === "round1") return `第 ${round} 轮`;
  if (phase === "round2") return `第 ${round} 轮`;
  return phase;
}

export function UtteranceBubble({ msg, index }: { msg: BubbleMessage; index: number }) {
  const align = msg.isHost || msg.isEvidence ? "center" : index % 2 === 0 ? "left" : "right";
  const accent = msg.accent ?? "#ffc93c";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "flex w-full gap-3",
        align === "center" ? "justify-center" : align === "right" ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/80 shadow-md"
        style={{ width: 44, height: 44 }}
      >
        {msg.avatar?.endsWith(".png") || msg.avatar?.endsWith(".jpg") ? (
          <Image src={msg.avatar} alt="" width={44} height={44} className="object-cover" />
        ) : msg.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={msg.avatar} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-amber-100">
            <TuanziAvatarSvg className="size-9" />
          </div>
        )}
        {msg.streaming && (
          <motion.span
            className="absolute inset-0 rounded-full ring-2"
            style={{ borderColor: accent }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>

      <div
        className={[
          "max-w-[min(100%,28rem)] rounded-2xl px-4 py-3 shadow-sm",
          msg.isEvidence
            ? "border border-sky-200/80 bg-sky-50/90"
            : msg.isHost
              ? "border border-amber-200/80 bg-amber-50/95"
              : "border border-stone-200/70 bg-white/90",
          align === "right" ? "rounded-tr-sm" : align === "left" ? "rounded-tl-sm" : "",
        ].join(" ")}
      >
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-stone-800">{msg.roleName}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide"
            style={{ backgroundColor: `${accent}33`, color: "#5c4a32" }}
          >
            {msg.modelLabel}
          </span>
          <span className="text-[10px] text-stone-400">{phaseLabel(msg.phase, msg.round)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
          {msg.content}
          {msg.streaming && (
            <motion.span
              className="ml-0.5 inline-block h-4 w-0.5 align-middle bg-amber-500"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </p>
      </div>
    </motion.div>
  );
}
