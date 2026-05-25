import type { YangLeaderboardEntry, YangSave } from "@/lib/yanglegeyang/types";
import { winRate } from "@/lib/yanglegeyang/engine";

export async function fetchCloudSave(): Promise<YangSave | null> {
  try {
    const res = await fetch("/api/yanglegeyang/save", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; save?: YangSave };
    return data.save ?? null;
  } catch {
    return null;
  }
}

export async function pushCloudSave(save: YangSave): Promise<YangSave | null> {
  try {
    const res = await fetch("/api/yanglegeyang/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ save }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; save?: YangSave };
    return data.save ?? null;
  } catch {
    return null;
  }
}

export async function syncLeaderboard(save: YangSave): Promise<YangLeaderboardEntry[] | null> {
  if (!save.playerName.trim()) return null;
  try {
    const res = await fetch("/api/yanglegeyang/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: save.playerId,
        playerName: save.playerName,
        bestLevel: save.bestLevel,
        totalWins: save.wins,
        totalClears: save.totalClears,
        winRate: winRate(save),
      }),
    });
    const data = (await res.json()) as { ok: boolean; list?: YangLeaderboardEntry[] };
    return data.ok ? (data.list ?? null) : null;
  } catch {
    return null;
  }
}

export async function fetchLeaderboard(): Promise<YangLeaderboardEntry[]> {
  try {
    const res = await fetch("/api/yanglegeyang/leaderboard", { cache: "no-store" });
    const data = (await res.json()) as { ok: boolean; list?: YangLeaderboardEntry[] };
    return data.ok ? (data.list ?? []) : [];
  } catch {
    return [];
  }
}
