import { createNewSave, migrateSave } from "@/lib/fish/engine";
import type { GameSave } from "@/lib/fish/types";

const STORAGE_KEY = "fish-game-save:v2";

export function loadSave(): GameSave {
  if (typeof window === "undefined") return createNewSave();
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("fish-game-save:v1");
    if (!raw) return createNewSave();
    return migrateSave(JSON.parse(raw) as Partial<GameSave>);
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
  localStorage.removeItem("fish-game-save:v1");
}

export { STORAGE_KEY };
