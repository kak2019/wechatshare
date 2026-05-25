import { createNewSave, migrateSave } from "@/lib/yanglegeyang/engine";
import type { YangSave } from "@/lib/yanglegeyang/types";

const STORAGE_KEY = "yanglegeyang-save:v1";

export function loadSave(): YangSave {
  if (typeof window === "undefined") return createNewSave();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createNewSave();
    return migrateSave(JSON.parse(raw) as Partial<YangSave>);
  } catch {
    return createNewSave();
  }
}

export function persistSave(save: YangSave): void {
  if (typeof window === "undefined") return;
  const next = { ...save, lastSaved: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
