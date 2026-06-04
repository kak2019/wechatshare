import { runMeeting } from "@/lib/tuanzi/engine";
import type { SseEvent } from "@/lib/tuanzi/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function encodeSse(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of runMeeting(id)) {
          controller.enqueue(encoder.encode(encodeSse(event)));
          if (event.type === "done" || event.type === "error") break;
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "流式传输失败";
        controller.enqueue(
          encoder.encode(encodeSse({ type: "error", message })),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
