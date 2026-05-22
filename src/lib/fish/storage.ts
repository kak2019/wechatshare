import { createNewSave } from "@/lib/fish/engine";
import type { GameSave } from "@/lib/fish/types";

const STORAGE_KEY = "fish-game-save:v1";

export function loadSave(): GameSave {
  if (typeof window === "undefined") return createNewSave();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createNewSave();
    const parsed = JSON.parse(raw) as GameSave;
    if (typeof parsed.gold !== "number") return createNewSave();
    return parsed;
  } catch {
    return createNewSave();
  }
}

export function persistSave(save: GameSave): void {
  if (typeof window === "undefined") return;
  const next = { ...save, lastSaved: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearSave(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY };
