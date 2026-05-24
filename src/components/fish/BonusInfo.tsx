"use client";

import { useState } from "react";

interface BonusInfoProps {
  text: string;
}

export function BonusInfo({ text }: BonusInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label="查看加成说明"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-teal-600 shadow ring-1 ring-teal-200 hover:bg-teal-50"
      >
        !
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="关闭"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-9 z-50 w-72 rounded-2xl bg-white p-4 text-xs leading-relaxed text-[var(--foreground)] shadow-xl ring-1 ring-black/[0.08]">
            <p className="mb-2 font-semibold text-teal-700">📊 当前加成</p>
            <p className="whitespace-pre-wrap text-[var(--mute)]">{text}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-lg bg-gray-100 py-1.5 text-[var(--mute)] hover:bg-gray-200"
            >
              知道了
            </button>
          </div>
        </>
      )}
    </div>
  );
}
