"use client";

import { ENDINGS } from "@/content/soviet-vn/meta";

type EndingGalleryProps = {
  unlocked: string[];
  onBack: () => void;
  onPersonality: () => void;
  canViewPersonality: boolean;
  dreamUnlocked: boolean;
  onDream: () => void;
};

export function EndingGallery({
  unlocked,
  onBack,
  onPersonality,
  canViewPersonality,
  dreamUnlocked,
  onDream,
}: EndingGalleryProps) {
  const allEndings = Object.values(ENDINGS);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8">
      <h2 className="text-center text-2xl font-semibold text-[#f5e9d4]">结局档案馆</h2>
      <p className="mt-2 text-center text-sm text-white/50">
        已解锁 {unlocked.length} / {allEndings.length}
      </p>

      <div className="mx-auto mt-8 grid w-full max-w-2xl gap-3">
        {allEndings.map((ending) => {
          const seen = unlocked.includes(ending.id);
          return (
            <div
              key={ending.id}
              className={`rounded-xl border p-4 ${
                seen
                  ? "border-[#c41e3a]/40 bg-[#1a0a0a]/60"
                  : "border-white/10 bg-black/20 opacity-50"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-medium text-[#f5e9d4]">
                  {seen ? ending.title : "？？？"}
                </h3>
                <span className="text-xs text-white/40">{ending.subtitle}</span>
              </div>
              {seen && (
                <p className="mt-2 text-sm leading-relaxed text-[#d4c4a8]/80">
                  {ending.body[0]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
        {dreamUnlocked && (
          <button
            type="button"
            onClick={onDream}
            className="rounded-lg border border-[#ffd700]/50 bg-[#ffd700]/10 px-5 py-2.5 text-sm text-[#ffd700]"
          >
            梦幻结局
          </button>
        )}
        {canViewPersonality && (
          <button
            type="button"
            onClick={onPersonality}
            className="rounded-lg border border-white/20 px-5 py-2.5 text-sm text-white/70"
          >
            人格档案
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-[#c41e3a] px-5 py-2.5 text-sm text-white"
        >
          返回
        </button>
      </div>
    </div>
  );
}
