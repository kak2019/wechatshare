import { NextResponse } from "next/server";

import { fetchEmbyPosterWall } from "@/lib/emby/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await fetchEmbyPosterWall(24);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Emby 不可用";
    return NextResponse.json({ error: message, items: [] }, { status: 502 });
  }
}
