import { NextResponse } from "next/server";

import { enqueueLibraryNotify } from "@/lib/wecom/batch";
import {
  formatEmbyNewItemMarkdown,
  notifyLibraryIngest,
  sendWecomMessage,
} from "@/lib/wecom/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type EmbyWebhookPayload = {
  Title?: string;
  Description?: string;
  Event?: string;
  Item?: {
    Name?: string;
    Type?: string;
    ProductionYear?: number;
    SeriesName?: string;
    SeasonName?: string;
    IndexNumber?: number;
    ParentIndexNumber?: number;
    Path?: string;
  };
  Server?: { Name?: string };
};

/**
 * Emby Webhook 接收端：新媒体入库后自动转发企业微信。
 * 在 Emby → 通知/Webhooks 里填：
 *   https://你的域名/api/notify/emby
 * 事件勾选 Library → New Media Added
 * Request content type 选 application/json（也兼容 multipart）
 */
export async function POST(request: Request) {
  try {
    if (!authorize(request)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const payload = await parseEmbyPayload(request);
    if (!payload) {
      return NextResponse.json({ ok: true, skipped: "empty" });
    }

    // 测试 webhook
    if (payload.Event === "system.webhooktest") {
      const result = await sendWecomMessage({
        msgtype: "markdown",
        markdown: {
          content:
            "## 仙女的浪漫小屋影业\n\nEmby Webhook 连通测试成功 ✅\n\n_系统通知_",
        },
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    }

    // 只处理新媒体
    if (payload.Event && payload.Event !== "library.new") {
      return NextResponse.json({ ok: true, skipped: payload.Event });
    }

    const item = payload.Item;
    if (!item?.Name) {
      // 有些测试/摘要只有 Title
      if (payload.Title) {
        const result = await sendWecomMessage({
          msgtype: "markdown",
          markdown: {
            content: `## 仙女的浪漫小屋影业\n\n${payload.Title}\n\n_Emby 通知_`,
          },
        });
        return NextResponse.json(result, { status: result.ok ? 200 : 502 });
      }
      return NextResponse.json({ ok: true, skipped: "no-item" });
    }

    // 单集不刷屏；Movie / Series / Season 进入 45s 合并缓冲
    if (item.Type === "Episode") {
      return NextResponse.json({ ok: true, skipped: "episode" });
    }

    enqueueLibraryNotify(
      {
        name: item.Name,
        type: item.Type,
        year: item.ProductionYear,
        seriesName: item.SeriesName,
      },
      async (batch) => {
        if (batch.length === 1) {
          const one = batch[0];
          await sendWecomMessage({
            msgtype: "markdown",
            markdown: {
              content: formatEmbyNewItemMarkdown({
                name: one.name,
                type: one.type,
                year: one.year,
                seriesName: one.seriesName,
              }),
            },
          });
          return;
        }
        await notifyLibraryIngest({
          title: "仙女的浪漫小屋影业 · 批量入库",
          items: batch.map((b) => {
            const year = b.year ? `（${b.year}）` : "";
            const kind =
              b.type === "Movie"
                ? "电影"
                : b.type === "Series"
                  ? "剧集"
                  : b.type === "Season"
                    ? "季"
                    : "";
            return `${b.name}${year}${kind ? ` · ${kind}` : ""}`;
          }),
          note: `来自 Emby「${payload.Server?.Name || "媒体库"}」自动刮削`,
        });
      },
    );

    return NextResponse.json({ ok: true, queued: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "webhook failed";
    console.error("[emby-webhook]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

async function parseEmbyPayload(
  request: Request,
): Promise<EmbyWebhookPayload | null> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const raw =
      form.get("data") ||
      form.get("payload") ||
      form.get("Webhook") ||
      [...form.values()][0];
    if (!raw) return null;
    const text =
      typeof raw === "string" ? raw : await (raw as Blob).text();
    return JSON.parse(text) as EmbyWebhookPayload;
  }

  if (
    contentType.includes("application/json") ||
    contentType.includes("text/plain") ||
    !contentType
  ) {
    const text = await request.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as EmbyWebhookPayload;
  }

  // 兜底
  const text = await request.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as EmbyWebhookPayload;
  } catch {
    return null;
  }
}

function authorize(request: Request): boolean {
  const expected = process.env.NOTIFY_SECRET?.trim();
  if (!expected) return true;
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("secret");
  const fromHeader = request.headers.get("x-notify-secret");
  return fromQuery === expected || fromHeader === expected;
}
