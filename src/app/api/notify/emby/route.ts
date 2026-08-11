import { NextResponse } from "next/server";

import { enqueueLibraryNotify } from "@/lib/wecom/batch";
import {
  notifyEmbyNewItems,
  sendWecomMarkdownV2,
} from "@/lib/wecom/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type EmbyWebhookPayload = {
  Title?: string;
  Description?: string;
  Event?: string;
  Item?: {
    Id?: string;
    Name?: string;
    Type?: string;
    ProductionYear?: number;
    SeriesName?: string;
    SeasonName?: string;
    IndexNumber?: number;
    ParentIndexNumber?: number;
    Overview?: string;
    Path?: string;
    ImageTags?: { Primary?: string };
  };
  Server?: { Name?: string };
};

/**
 * Emby Webhook 接收端：新媒体入库后自动转发企业微信（markdown_v2 + 封面）。
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
      const result = await sendWecomMarkdownV2(
        [
          `# 仙女的浪漫小屋影业`,
          "",
          "Emby Webhook 连通测试成功 ✅",
          "",
          "_系统通知_",
        ].join("\n"),
      );
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
        const result = await sendWecomMarkdownV2(
          [
            `# 仙女的浪漫小屋影业`,
            "",
            payload.Title,
            "",
            `_Emby 通知_`,
          ].join("\n"),
        );
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
        overview: item.Overview,
        embyId: item.Id,
        imageTag: item.ImageTags?.Primary,
      },
      async (batch) => {
        await notifyEmbyNewItems(batch, {
          serverName: payload.Server?.Name,
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
