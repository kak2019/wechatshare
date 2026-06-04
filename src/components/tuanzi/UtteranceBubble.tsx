"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { BubbleMarkdown } from "@/components/tuanzi/BubbleMarkdown";
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

function bubbleShell(msg: BubbleMessage, align: "left" | "right" | "center") {
  if (msg.isEvidence) {
    return {
      wrap: "max-w-[min(100%,36rem)]",
      card: "border border-sky-200/90 bg-gradient-to-br from-sky-50/95 via-white to-sky-50/40 shadow-[0_8px_30px_rgba(56,189,248,0.12)]",
      tail: align === "center" ? "" : "",
    };
  }
  if (msg.isHost) {
    return {
      wrap: "max-w-[min(100%,34rem)]",
      card: "border border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-[#fff9eb] to-amber-100/50 shadow-[0_8px_28px_rgba(255,201,60,0.18)]",
      tail: "",
    };
  }
  if (align === "right") {
    return {
      wrap: "max-w-[min(100%,32rem)]",
      card: "border border-stone-200/60 bg-gradient-to-br from-white via-white to-stone-50/80 shadow-[0_6px_24px_rgba(28,25,23,0.06)]",
      tail: "rounded-tr-md",
    };
  }
  return {
    wrap: "max-w-[min(100%,32rem)]",
    card: "border border-stone-200/70 bg-gradient-to-br from-[#fffdf8] via-white to-amber-50/30 shadow-[0_6px_24px_rgba(28,25,23,0.05)]",
    tail: "rounded-tl-md",
  };
}

export function UtteranceBubble({ msg, index }: { msg: BubbleMessage; index: number }) {
  const align: "left" | "right" | "center" =
    msg.isHost || msg.isEvidence ? "center" : index % 2 === 0 ? "left" : "right";
  const accent = msg.accent ?? "#ffc93c";
  const shell = bubbleShell(msg, align);

  const variant = msg.isEvidence ? "evidence" : msg.isHost ? "host" : "default";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "flex w-full gap-3 sm:gap-4",
        align === "center" ? "justify-center" : align === "right" ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-full shadow-md ring-2 ring-white"
        style={{ width: 48, height: 48, boxShadow: `0 4px 14px ${accent}33` }}
      >
        {msg.avatar?.endsWith(".png") || msg.avatar?.endsWith(".jpg") ? (
          <Image src={msg.avatar} alt="" width={48} height={48} className="object-cover" />
        ) : msg.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={msg.avatar} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-amber-100">
            <TuanziAvatarSvg className="size-10" />
          </div>
        )}
        {msg.streaming && (
          <motion.span
            className="absolute inset-0 rounded-full ring-2 ring-offset-1 ring-offset-white"
            style={{ borderColor: accent }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
        )}
      </div>

      <div className={[shell.wrap, "min-w-0 flex-1 sm:flex-none"].join(" ")}>
        <div
          className={[
            "relative overflow-hidden rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4",
            shell.card,
            shell.tail,
          ].join(" ")}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
          />

          <header className="mb-2.5 flex flex-wrap items-center gap-2 border-b border-stone-200/50 pb-2">
            {msg.isEvidence && (
              <span className="text-xs" aria-hidden>
                📡
              </span>
            )}
            <span className="text-sm font-semibold tracking-tight text-stone-900">{msg.roleName}</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide"
              style={{
                backgroundColor: `${accent}28`,
                color: "#4a3f32",
                boxShadow: `inset 0 0 0 1px ${accent}44`,
              }}
            >
              {msg.modelLabel}
            </span>
            <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-stone-400/90">
              {phaseLabel(msg.phase, msg.round)}
            </span>
          </header>

          <BubbleMarkdown content={msg.content} variant={variant} streaming={msg.streaming} />
        </div>
      </div>
    </motion.article>
  );
}
