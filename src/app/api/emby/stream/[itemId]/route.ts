import { openEmbyTranscodedStream } from "@/lib/emby/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { itemId } = await context.params;

  try {
    const { stream, contentType } = await openEmbyTranscodedStream(itemId);
    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "Accept-Ranges": "none",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "播放失败";
    return new Response(message, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
