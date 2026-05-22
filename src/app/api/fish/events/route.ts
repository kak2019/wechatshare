import { NextResponse } from "next/server";

import {
  activateWeatherBuff,
  getGlobalState,
  isWeatherBuffActive,
  pushGlobalEvent,
} from "@/lib/fish/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getGlobalState();
  return NextResponse.json({
    ok: true,
    events: state.events,
    weatherActive: isWeatherBuffActive(state),
    weatherBuffBy: state.weatherBuffBy,
    weatherBuffUntil: state.weatherBuffUntil,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: string;
      playerName?: string;
      message?: string;
      type?: "catch" | "weather" | "encounter" | "dragon";
    };

    const name = body.playerName?.trim().slice(0, 16);
    if (!name) {
      return NextResponse.json({ ok: false, error: "需要玩家名字" }, { status: 400 });
    }

    if (body.action === "weather") {
      const state = await activateWeatherBuff(name);
      return NextResponse.json({
        ok: true,
        events: state.events,
        weatherActive: true,
        weatherBuffBy: state.weatherBuffBy,
        weatherBuffUntil: state.weatherBuffUntil,
      });
    }

    if (body.action === "broadcast" && body.message) {
      const state = await pushGlobalEvent({
        type: body.type ?? "catch",
        playerName: name,
        message: body.message.slice(0, 120),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
      return NextResponse.json({ ok: true, events: state.events });
    }

    return NextResponse.json({ ok: false, error: "未知操作" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "服务器错误" }, { status: 500 });
  }
}
