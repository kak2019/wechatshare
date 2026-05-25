"use client";

import { motion } from "framer-motion";

type ChoicePanelProps = {
  options: { label: string }[];
  onPick: (index: number) => void;
};

export function ChoicePanel({ options, onPick }: ChoicePanelProps) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      {options.map((opt, i) => (
        <motion.button
          key={opt.label}
          type="button"
          className="rounded-lg border border-[#c41e3a]/40 bg-[#1a0a0a]/80 px-4 py-3 text-left text-sm leading-snug text-[#f5e9d4] transition hover:border-[#c41e3a] hover:bg-[#2a1010] sm:text-base"
          onClick={() => onPick(i)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.35 }}
        >
          <span className="mr-2 text-[#c41e3a]">{String.fromCharCode(65 + i)}.</span>
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}
