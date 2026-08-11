import { NextResponse } from "next/server";

import {
  notifyLibraryIngest,
  sendWecomMarkdownV2,
  type LibraryNotifyItem,
} from "@/lib/wecom/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 刮削入库完成后的主动通知（markdown_v2 + 剧封面）。
 * POST /api/notify/library
 * Body: {
 *   title?,
 *   items?: string[] | { name, type?, year?, embyId?, coverUrl?, overview? }[],
 *   note?,
 *   content?,  // 原始 markdown_v2
 *   secret?
 * }
 *
 * 可选鉴权：请求头 x-notify-secret 或 body.secret / ?secret=
 * 与环境变量 NOTIFY_SECRET 一致（未配置则不校验）
 */
export async function POST(request: Request) {
  try {
    if (!authorize(request)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      items?: Array<string | LibraryNotifyItem>;
      note?: string;
      content?: string;
    };

    // 兼容只传一段文案（按 markdown_v2 发送）
    if (body.content && !body.items?.length && !body.title) {
      const result = await sendWecomMarkdownV2(body.content);
      return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    }

    const result = await notifyLibraryIngest({
      title: body.title,
      items: body.items,
      note: body.note,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "notify failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
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
