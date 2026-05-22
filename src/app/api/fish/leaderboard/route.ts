import { NextResponse } from "next/server";

import {
  activateWeatherBuff,
  getGlobalState,
  getLeaderboard,
  pushGlobalEvent,
  upsertLeaderboard,
} from "@/lib/fish/server-store";
import type { LeaderboardEntry } from "@/lib/fish/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await getLeaderboard();
  return NextResponse.json({ ok: true, list });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LeaderboardEntry>;
    if (!body.playerId || !body.playerName?.trim()) {
      return NextResponse.json({ ok: false, error: "需要玩家 ID 和名字" }, { status: 400 });
    }

    const entry: LeaderboardEntry = {
      playerId: body.playerId,
      playerName: body.playerName.trim().slice(0, 16),
      totalGold: Math.max(0, Math.floor(body.totalGold ?? 0)),
      towerFloor: Math.max(0, Math.floor(body.towerFloor ?? 0)),
      totalCatches: Math.max(0, Math.floor(body.totalCatches ?? 0)),
      mythicalCount: Math.max(0, Math.floor(body.mythicalCount ?? 0)),
      rodLevel: Math.max(1, Math.floor(body.rodLevel ?? 1)),
      updatedAt: Date.now(),
    };

    const list = await upsertLeaderboard(entry);
    return NextResponse.json({ ok: true, list, entry });
  } catch {
    return NextResponse.json({ ok: false, error: "服务器错误" }, { status: 500 });
  }
}
