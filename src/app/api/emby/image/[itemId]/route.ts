import { NextResponse } from "next/server";

import { fetchEmbyPrimaryImage } from "@/lib/emby/client";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { itemId } = await context.params;
  const tag = new URL(request.url).searchParams.get("tag");

  try {
    const image = await fetchEmbyPrimaryImage(itemId, tag);
    if (!image) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(image.body, {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Bad Gateway", { status: 502 });
  }
}
