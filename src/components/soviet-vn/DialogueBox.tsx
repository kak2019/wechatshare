"use client";

import { motion } from "framer-motion";

import { PROTAGONIST } from "@/content/soviet-vn/meta";

type DialogueBoxProps = {
  line: { kind: "narrate" | "say"; speaker?: string; text: string } | null;
  hint?: string;
  onAdvance: () => void;
};

export function DialogueBox({ line, hint, onAdvance }: DialogueBoxProps) {
  if (!line) return null;

  const isNarrate = line.kind === "narrate";
  const speaker =
    line.speaker === "科尔恰金" ? PROTAGONIST.fullName : line.speaker;

  return (
    <motion.button
      type="button"
      className="relative w-full rounded-xl border border-[#c41e3a]/30 bg-[#0a0808]/90 p-4 text-left shadow-[0_0_40px_rgba(196,30,58,0.15)] backdrop-blur-md sm:p-5"
      onClick={onAdvance}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {!isNarrate && speaker && (
        <p className="mb-2 text-xs font-semibold tracking-wider text-[#c41e3a] sm:text-sm">
          {speaker}
        </p>
      )}
      <p
        className={`leading-relaxed sm:text-lg ${
          isNarrate ? "text-[#d4c4a8]/90 italic" : "text-[#f5e9d4]"
        }`}
      >
        {line.text}
      </p>
      {hint && (
        <p className="mt-3 text-right text-[10px] tracking-widest text-white/30 uppercase sm:text-xs">
          {hint}
        </p>
      )}
    </motion.button>
  );
}
