import { DEFAULT_STATS } from "@/lib/soviet-vn/types";
import type { SovietSave } from "@/lib/soviet-vn/types";

const STORAGE_KEY = "soviet-vn-save:v1";

export function createNewSave(): SovietSave {
  return {
    version: 1,
    unlockedEndings: [],
    seenDream: false,
    bestStats: { ...DEFAULT_STATS },
    runHistory: [],
    muted: false,
    inProgress: null,
    lastSaved: Date.now(),
  };
}

function migrateSave(raw: Partial<SovietSave>): SovietSave {
  const base = createNewSave();
  return {
    ...base,
    ...raw,
    version: 1,
    unlockedEndings: raw.unlockedEndings ?? base.unlockedEndings,
    seenDream: raw.seenDream ?? base.seenDream,
    bestStats: { ...base.bestStats, ...(raw.bestStats ?? {}) },
    runHistory: raw.runHistory ?? base.runHistory,
    muted: raw.muted ?? base.muted,
    inProgress: raw.inProgress ?? null,
    lastSaved: raw.lastSaved ?? Date.now(),
  };
}

export function loadSave(): SovietSave {
  if (typeof window === "undefined") return createNewSave();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createNewSave();
    return migrateSave(JSON.parse(raw) as Partial<SovietSave>);
  } catch {
    return createNewSave();
  }
}

export function persistSave(save: SovietSave): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...save, lastSaved: Date.now() }),
  );
}
