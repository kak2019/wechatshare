import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import {
  createSessionToken,
  hashPassword,
  normalizeUsername,
  sessionExpiresAt,
  userIdFromUsername,
  verifyPassword,
} from "@/lib/fish/auth-crypto";
import { migrateSave } from "@/lib/fish/engine";
import type { GameSave, GlobalEvent, GlobalState, LeaderboardEntry } from "@/lib/fish/types";

const DATA_DIR = path.join(process.cwd(), "data", "fish");
const SAVES_DIR = path.join(DATA_DIR, "saves");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

const MAX_LEADERBOARD = 100;
const MAX_EVENTS = 50;
const WEATHER_BUFF_MS = 30 * 60 * 1000;

export interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(SAVES_DIR, { recursive: true });
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

function savePath(userId: string) {
  return path.join(SAVES_DIR, `${userId}.json`);
}

// ── Leaderboard ──

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

// ── Global events ──

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

// ── Auth ──

async function getUsers(): Promise<UserRecord[]> {
  return readJson<UserRecord[]>(USERS_FILE, []);
}

async function getSessions(): Promise<SessionRecord[]> {
  const sessions = await readJson<SessionRecord[]>(SESSIONS_FILE, []);
  const now = Date.now();
  const valid = sessions.filter((s) => s.expiresAt > now);
  if (valid.length !== sessions.length) await writeJson(SESSIONS_FILE, valid);
  return valid;
}

export async function registerUser(
  username: string,
  password: string,
  displayName: string,
): Promise<{ user: UserRecord; token: string } | { error: string }> {
  const name = username.trim();
  const norm = normalizeUsername(name);
  if (!norm) return { error: "用户名无效" };

  const users = await getUsers();
  if (users.some((u) => u.username === norm)) return { error: "用户名已存在" };

  const { hash, salt } = hashPassword(password);
  const user: UserRecord = {
    id: userIdFromUsername(name),
    username: norm,
    displayName: displayName.trim().slice(0, 16) || name,
    passwordHash: hash,
    salt,
    createdAt: Date.now(),
  };
  users.push(user);
  await writeJson(USERS_FILE, users);

  const token = createSessionToken();
  const sessions = await getSessions();
  sessions.push({ token, userId: user.id, expiresAt: sessionExpiresAt() });
  await writeJson(SESSIONS_FILE, sessions);

  return { user, token };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ user: UserRecord; token: string } | { error: string }> {
  const norm = normalizeUsername(username);
  const users = await getUsers();
  const user = users.find((u) => u.username === norm);
  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return { error: "用户名或密码错误" };
  }

  const token = createSessionToken();
  const sessions = await getSessions();
  sessions.push({ token, userId: user.id, expiresAt: sessionExpiresAt() });
  await writeJson(SESSIONS_FILE, sessions);

  return { user, token };
}

export async function logoutUser(token: string): Promise<void> {
  const sessions = await getSessions();
  await writeJson(
    SESSIONS_FILE,
    sessions.filter((s) => s.token !== token),
  );
}

export async function getUserByToken(token: string): Promise<UserRecord | null> {
  if (!token) return null;
  const sessions = await getSessions();
  const session = sessions.find((s) => s.token === token);
  if (!session) return null;
  const users = await getUsers();
  return users.find((u) => u.id === session.userId) ?? null;
}

// ── Cloud save ──

export async function loadCloudSave(userId: string): Promise<GameSave | null> {
  try {
    const raw = await readFile(savePath(userId), "utf-8");
    return migrateSave(JSON.parse(raw) as Partial<GameSave>);
  } catch {
    return null;
  }
}

export async function saveCloudSave(userId: string, save: GameSave): Promise<GameSave> {
  const next = { ...save, accountId: userId, lastSaved: Date.now() };
  await ensureDir();
  await writeFile(savePath(userId), JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export const SESSION_COOKIE = "fish_session";
