import { NextResponse } from "next/server";

import { getEmbyPlayInfo } from "@/lib/emby/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { itemId } = await context.params;
  try {
    const info = await getEmbyPlayInfo(itemId);
    return NextResponse.json(info);
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法播放";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
