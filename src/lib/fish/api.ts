import type { GameSave, LeaderboardEntry } from "@/lib/fish/types";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

export async function fetchAuth(): Promise<{ loggedIn: boolean; user?: AuthUser }> {
  try {
    const res = await fetch("/api/fish/auth", { cache: "no-store" });
    const data = (await res.json()) as { ok: boolean; loggedIn: boolean; user?: AuthUser };
    return { loggedIn: !!data.loggedIn, user: data.user };
  } catch {
    return { loggedIn: false };
  }
}

export async function login(username: string, password: string) {
  const res = await fetch("/api/fish/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });
  return (await res.json()) as { ok: boolean; error?: string; user?: AuthUser };
}

export async function register(username: string, password: string, displayName: string) {
  const res = await fetch("/api/fish/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", username, password, displayName }),
  });
  return (await res.json()) as { ok: boolean; error?: string; user?: AuthUser };
}

export async function logout() {
  await fetch("/api/fish/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
}

export async function fetchCloudSave(): Promise<GameSave | null> {
  try {
    const res = await fetch("/api/fish/save", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; save?: GameSave };
    return data.save ?? null;
  } catch {
    return null;
  }
}

export async function pushCloudSave(save: GameSave): Promise<GameSave | null> {
  try {
    const res = await fetch("/api/fish/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ save }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; save?: GameSave };
    return data.save ?? null;
  } catch {
    return null;
  }
}

export async function syncLeaderboard(save: GameSave): Promise<LeaderboardEntry[] | null> {
  if (!save.playerName.trim()) return null;
  try {
    const mythicalCount = Object.entries(save.codex).filter(([id, n]) => {
      if (n <= 0) return false;
      return ["qinglong", "baihu", "zhuque", "xuanwu"].includes(id);
    }).length;

    const res = await fetch("/api/fish/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: save.playerId,
        playerName: save.playerName,
        totalGold: save.gold,
        towerFloor: save.towerFloor,
        totalCatches: save.totalCatches,
        mythicalCount,
        rodLevel: save.rodLevel,
      }),
    });
    const data = (await res.json()) as { ok: boolean; list?: LeaderboardEntry[] };
    return data.ok ? (data.list ?? null) : null;
  } catch {
    return null;
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch("/api/fish/leaderboard", { cache: "no-store" });
    const data = (await res.json()) as { ok: boolean; list?: LeaderboardEntry[] };
    return data.ok ? (data.list ?? []) : [];
  } catch {
    return [];
  }
}

export interface EventsResponse {
  events: import("@/lib/fish/types").GlobalEvent[];
  weatherActive: boolean;
  weatherBuffBy: string;
  weatherBuffUntil: number;
}

export async function fetchGlobalEvents(): Promise<EventsResponse | null> {
  try {
    const res = await fetch("/api/fish/events", { cache: "no-store" });
    const data = (await res.json()) as EventsResponse & { ok: boolean };
    return data.ok ? data : null;
  } catch {
    return null;
  }
}

export async function broadcastCatch(
  playerName: string,
  message: string,
  type: "catch" | "weather" | "encounter" | "dragon" = "catch",
) {
  try {
    await fetch("/api/fish/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "broadcast", playerName, message, type }),
    });
  } catch {
    /* ignore */
  }
}

export async function useWeatherCard(playerName: string) {
  try {
    const res = await fetch("/api/fish/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "weather", playerName }),
    });
    return (await res.json()) as EventsResponse & { ok: boolean };
  } catch {
    return null;
  }
}
