import type { BreakoutSave } from "@/lib/breakout/types";

const STORAGE_KEY = "breakout-save:v1";

export function createDefaultSave(): BreakoutSave {
  return {
    version: 1,
    highScore: 0,
    maxLevel: 0,
    totalBricks: 0,
    soundOn: true,
  };
}

export function loadSave(): BreakoutSave {
  if (typeof window === "undefined") return createDefaultSave();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSave();
    const parsed = JSON.parse(raw) as Partial<BreakoutSave>;
    return { ...createDefaultSave(), ...parsed, version: 1 };
  } catch {
    return createDefaultSave();
  }
}

export function persistSave(save: BreakoutSave): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}
