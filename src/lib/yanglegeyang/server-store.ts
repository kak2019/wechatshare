import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { migrateSave } from "@/lib/yanglegeyang/engine";
import type { YangLeaderboardEntry, YangSave } from "@/lib/yanglegeyang/types";

const DATA_DIR = path.join(process.cwd(), "data", "yanglegeyang");
const SAVES_DIR = path.join(DATA_DIR, "saves");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");

const MAX_LEADERBOARD = 100;

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

export async function getLeaderboard(): Promise<YangLeaderboardEntry[]> {
  const list = await readJson<YangLeaderboardEntry[]>(LEADERBOARD_FILE, []);
  return list.sort((a, b) => {
    if (b.totalClears !== a.totalClears) return b.totalClears - a.totalClears;
    if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
    return b.winRate - a.winRate;
  });
}

export async function upsertLeaderboard(entry: YangLeaderboardEntry): Promise<YangLeaderboardEntry[]> {
  const list = await readJson<YangLeaderboardEntry[]>(LEADERBOARD_FILE, []);
  const idx = list.findIndex((e) => e.playerId === entry.playerId);
  const next = { ...entry, updatedAt: Date.now() };
  if (idx >= 0) list[idx] = next;
  else list.push(next);

  const sorted = list
    .sort((a, b) => {
      if (b.totalClears !== a.totalClears) return b.totalClears - a.totalClears;
      if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
      return b.winRate - a.winRate;
    })
    .slice(0, MAX_LEADERBOARD);

  await writeJson(LEADERBOARD_FILE, sorted);
  return sorted;
}

export async function loadCloudSave(userId: string): Promise<YangSave | null> {
  try {
    const raw = await readFile(savePath(userId), "utf-8");
    return migrateSave(JSON.parse(raw) as Partial<YangSave>);
  } catch {
    return null;
  }
}

export async function saveCloudSave(userId: string, save: YangSave): Promise<YangSave> {
  const next = { ...save, accountId: userId, lastSaved: Date.now() };
  await ensureDir();
  await writeFile(savePath(userId), JSON.stringify(next, null, 2), "utf-8");
  return next;
}
