import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { GlobalEvent, GlobalState, LeaderboardEntry } from "@/lib/fish/types";

const DATA_DIR = path.join(process.cwd(), "data", "fish");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

const MAX_LEADERBOARD = 100;
const MAX_EVENTS = 50;
const WEATHER_BUFF_MS = 30 * 60 * 1000;

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T) {
  await ensureDir();
  await writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const list = await readJson<LeaderboardEntry[]>(LEADERBOARD_FILE, []);
  return list.sort((a, b) => {
    if (b.towerFloor !== a.towerFloor) return b.towerFloor - a.towerFloor;
    if (b.totalGold !== a.totalGold) return b.totalGold - a.totalGold;
    return b.totalCatches - a.totalCatches;
  });
}

export async function upsertLeaderboard(entry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
  const list = await readJson<LeaderboardEntry[]>(LEADERBOARD_FILE, []);
  const idx = list.findIndex((e) => e.playerId === entry.playerId);
  const next = { ...entry, updatedAt: Date.now() };
  if (idx >= 0) list[idx] = next;
  else list.push(next);

  const sorted = list
    .sort((a, b) => {
      if (b.towerFloor !== a.towerFloor) return b.towerFloor - a.towerFloor;
      if (b.totalGold !== a.totalGold) return b.totalGold - a.totalGold;
      return b.totalCatches - a.totalCatches;
    })
    .slice(0, MAX_LEADERBOARD);

  await writeJson(LEADERBOARD_FILE, sorted);
  return sorted;
}

function defaultGlobalState(): GlobalState {
  return { events: [], weatherBuffUntil: 0, weatherBuffBy: "" };
}

export async function getGlobalState(): Promise<GlobalState> {
  const state = await readJson<GlobalState>(EVENTS_FILE, defaultGlobalState());
  const now = Date.now();
  state.events = (state.events ?? []).filter((e) => !e.expiresAt || e.expiresAt > now);
  if (state.weatherBuffUntil && state.weatherBuffUntil < now) {
    state.weatherBuffUntil = 0;
    state.weatherBuffBy = "";
  }
  return state;
}

export async function pushGlobalEvent(event: Omit<GlobalEvent, "id" | "createdAt">): Promise<GlobalState> {
  const state = await getGlobalState();
  const full: GlobalEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  state.events = [full, ...state.events].slice(0, MAX_EVENTS);
  await writeJson(EVENTS_FILE, state);
  return state;
}

export async function activateWeatherBuff(playerName: string): Promise<GlobalState> {
  const state = await getGlobalState();
  const now = Date.now();
  state.weatherBuffUntil = now + WEATHER_BUFF_MS;
  state.weatherBuffBy = playerName;
  const msg = `${playerName} 使用了「天气不错卡」—— 今天天气真好，适合钓鱼！`;
  state.events = [
    {
      id: `weather-${now}`,
      type: "weather" as const,
      playerName,
      message: msg,
      createdAt: now,
      expiresAt: state.weatherBuffUntil,
    },
    ...state.events,
  ].slice(0, MAX_EVENTS);
  await writeJson(EVENTS_FILE, state);
  return state;
}

export function isWeatherBuffActive(state: GlobalState): boolean {
  return state.weatherBuffUntil > Date.now();
}
