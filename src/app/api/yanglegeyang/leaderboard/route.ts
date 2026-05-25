import { NextResponse } from "next/server";

import { getLeaderboard, upsertLeaderboard } from "@/lib/yanglegeyang/server-store";
import type { YangLeaderboardEntry } from "@/lib/yanglegeyang/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await getLeaderboard();
  return NextResponse.json({ ok: true, list });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<YangLeaderboardEntry>;
    if (!body.playerId || !body.playerName?.trim()) {
      return NextResponse.json({ ok: false, error: "需要玩家 ID 和名字" }, { status: 400 });
    }

    const entry: YangLeaderboardEntry = {
      playerId: body.playerId,
      playerName: body.playerName.trim().slice(0, 16),
      bestLevel: Math.max(0, Math.floor(body.bestLevel ?? 0)),
      totalWins: Math.max(0, Math.floor(body.totalWins ?? 0)),
      totalClears: Math.max(0, Math.floor(body.totalClears ?? 0)),
      winRate: Math.max(0, Math.min(100, Math.floor(body.winRate ?? 0))),
      updatedAt: Date.now(),
    };

    const list = await upsertLeaderboard(entry);
    return NextResponse.json({ ok: true, list, entry });
  } catch {
    return NextResponse.json({ ok: false, error: "服务器错误" }, { status: 500 });
  }
}
