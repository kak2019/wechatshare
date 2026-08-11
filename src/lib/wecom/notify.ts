import { createHash } from "node:crypto";

import {
  buildPublicPosterUrl,
  fetchEmbyItemMeta,
  fetchEmbyPrimaryImage,
  searchEmbyByName,
} from "@/lib/emby/client";

const DEFAULT_WEBHOOK =
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=636eff2e-94fd-4a5f-9bca-f89e9b94badf";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function getWecomWebhookUrl(): string {
  return (
    process.env.WECOM_WEBHOOK_URL?.trim() ||
    process.env.WECHAT_WORK_WEBHOOK_URL?.trim() ||
    DEFAULT_WEBHOOK
  );
}

export type WecomTextMessage = {
  msgtype: "text";
  text: { content: string; mentioned_list?: string[] };
};

export type WecomMarkdownMessage = {
  msgtype: "markdown";
  markdown: { content: string };
};

/** 支持 ![封面](url) 嵌图，企微客户端需较新版本 */
export type WecomMarkdownV2Message = {
  msgtype: "markdown_v2";
  markdown_v2: { content: string };
};

export type WecomImageMessage = {
  msgtype: "image";
  image: { base64: string; md5: string };
};

export type WecomMessage =
  | WecomTextMessage
  | WecomMarkdownMessage
  | WecomMarkdownV2Message
  | WecomImageMessage;

export type LibraryNotifyItem = {
  name: string;
  type?: string;
  year?: number | string | null;
  seriesName?: string | null;
  overview?: string | null;
  /** Emby Item Id，有则优先拉海报 */
  embyId?: string | null;
  imageTag?: string | null;
  coverUrl?: string | null;
  openUrl?: string | null;
};

export async function sendWecomMessage(
  message: WecomMessage,
): Promise<{ ok: boolean; errmsg: string }> {
  const url = getWecomWebhookUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    errcode?: number;
    errmsg?: string;
  };
  if (!res.ok || data.errcode) {
    return {
      ok: false,
      errmsg: data.errmsg || `HTTP ${res.status}`,
    };
  }
  return { ok: true, errmsg: "ok" };
}

export async function sendWecomImage(
  body: ArrayBuffer | Buffer,
): Promise<{ ok: boolean; errmsg: string }> {
  let buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  if (buf.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, errmsg: "image too large (>2MB)" };
  }
  // 企微只要 JPG/PNG；Emby 偶尔给 webp，仍尝试发送
  const base64 = buf.toString("base64");
  const md5 = createHash("md5").update(buf).digest("hex");
  return sendWecomMessage({
    msgtype: "image",
    image: { base64, md5 },
  });
}

export async function sendWecomMarkdownV2(
  content: string,
): Promise<{ ok: boolean; errmsg: string }> {
  return sendWecomMessage({
    msgtype: "markdown_v2",
    markdown_v2: { content },
  });
}

/** 刮削入库完成通知（批量摘要，markdown_v2 + 封面） */
export async function notifyLibraryIngest(input: {
  title?: string;
  items?: Array<string | LibraryNotifyItem>;
  note?: string;
}): Promise<{ ok: boolean; errmsg: string; covers?: number }> {
  const title = input.title?.trim() || "仙女的浪漫小屋影业 · 新剧入库";
  const note = input.note?.trim();
  const rawItems = input.items || [];

  const items: LibraryNotifyItem[] = [];
  for (const raw of rawItems) {
    if (typeof raw === "string") {
      const name = raw.trim();
      if (name) items.push({ name });
    } else if (raw?.name?.trim()) {
      items.push({ ...raw, name: raw.name.trim() });
    }
  }

  // 补全 Emby 元数据 / 封面
  const enriched = await Promise.all(items.map((it) => enrichNotifyItem(it)));

  let coversSent = 0;
  // 先发最多 3 张封面图（企微 image 最稳），再发 markdown_v2 正文
  for (const it of enriched.slice(0, 3)) {
    const sent = await maybeSendCoverImage(it);
    if (sent) coversSent += 1;
  }

  const lines: string[] = [`# ${title}`, ""];

  if (!enriched.length) {
    lines.push("本次入库已完成。");
  } else if (enriched.length === 1) {
    lines.push(...formatSingleItemMarkdown(enriched[0]));
  } else {
    for (let i = 0; i < enriched.length; i++) {
      const it = enriched[i];
      const meta = [embyTypeLabel(it.type), it.year ? String(it.year) : null]
        .filter(Boolean)
        .join(" · ");
      const cover = resolveCoverUrl(it);
      if (cover) {
        lines.push(`![${it.name}](${cover})`);
      }
      lines.push(`${i + 1}. **${displayName(it)}**${meta ? `（${meta}）` : ""}`);
      if (it.openUrl) {
        lines.push(`   [在 Emby 打开](${it.openUrl})`);
      }
      lines.push("");
    }
  }

  if (note) {
    lines.push(`> ${note}`, "");
  }
  lines.push(`_刮削入库通知 · ${formatNow()}_`);

  const result = await sendWecomMarkdownV2(lines.join("\n").trim());
  return { ...result, covers: coversSent };
}

/** 单条新媒体通知（Emby library.new） */
export function formatEmbyNewItemMarkdown(item: LibraryNotifyItem): string {
  const lines = [
    `# 仙女的浪漫小屋影业 · 新片上架`,
    "",
    ...formatSingleItemMarkdown(item),
    "",
    `_Emby 自动通知 · ${formatNow()}_`,
  ];
  return lines.join("\n").trim();
}

export async function notifyEmbyNewItems(
  batch: LibraryNotifyItem[],
  opts?: { serverName?: string },
): Promise<{ ok: boolean; errmsg: string }> {
  const enriched = await Promise.all(batch.map((it) => enrichNotifyItem(it)));

  if (enriched.length === 1) {
    const one = enriched[0];
    await maybeSendCoverImage(one);
    return sendWecomMarkdownV2(formatEmbyNewItemMarkdown(one));
  }

  return notifyLibraryIngest({
    title: "仙女的浪漫小屋影业 · 批量入库",
    items: enriched,
    note: `来自 Emby「${opts?.serverName || "媒体库"}」自动刮削`,
  });
}

function formatSingleItemMarkdown(item: LibraryNotifyItem): string[] {
  const typeLabel = embyTypeLabel(item.type);
  const meta = [typeLabel, item.year ? String(item.year) : null]
    .filter(Boolean)
    .join(" · ");
  const cover = resolveCoverUrl(item);
  const lines: string[] = [];
  if (cover) {
    lines.push(`![${item.name}](${cover})`, "");
  }
  lines.push(`## ${displayName(item)}`);
  if (meta) lines.push(meta);
  if (item.overview) {
    const brief = item.overview.replace(/\s+/g, " ").trim().slice(0, 120);
    if (brief) lines.push("", `> ${brief}${item.overview.length > 120 ? "…" : ""}`);
  }
  if (item.openUrl) {
    lines.push("", `[在 Emby 打开](${item.openUrl})`);
  }
  return lines;
}

function displayName(item: LibraryNotifyItem): string {
  if (item.type === "Episode" && item.seriesName) {
    return `${item.seriesName} · ${item.name}`;
  }
  if (item.type === "Season" && item.seriesName) {
    return `${item.seriesName} · ${item.name}`;
  }
  return item.name;
}

function resolveCoverUrl(item: LibraryNotifyItem): string | null {
  if (item.coverUrl?.trim()) return item.coverUrl.trim();
  if (item.embyId) {
    return buildPublicPosterUrl(item.embyId, item.imageTag);
  }
  return null;
}

async function enrichNotifyItem(
  item: LibraryNotifyItem,
): Promise<LibraryNotifyItem> {
  if (item.embyId && (item.imageTag || item.coverUrl || item.overview)) {
    if (!item.coverUrl && item.embyId) {
      return {
        ...item,
        coverUrl: buildPublicPosterUrl(item.embyId, item.imageTag),
      };
    }
    return item;
  }

  try {
    if (item.embyId) {
      const meta = await fetchEmbyItemMeta(item.embyId);
      if (meta) {
        return {
          ...item,
          name: item.name || meta.name,
          type: item.type || meta.type,
          year: item.year ?? meta.year,
          seriesName: item.seriesName ?? meta.seriesName,
          overview: item.overview ?? meta.overview,
          imageTag: item.imageTag ?? meta.imageTag,
          openUrl: item.openUrl ?? meta.openUrl,
          coverUrl:
            item.coverUrl ||
            (meta.imageTag
              ? buildPublicPosterUrl(meta.id, meta.imageTag)
              : null),
          embyId: meta.id,
        };
      }
    }

    // 仅有片名时，去 Emby 搜封面
    const found = await searchEmbyByName(item.name);
    if (!found) return item;
    return {
      ...item,
      embyId: item.embyId || found.id,
      type: item.type || found.type,
      year: item.year ?? found.year,
      overview: item.overview ?? found.overview,
      imageTag: item.imageTag ?? found.imageTag,
      openUrl: item.openUrl ?? found.openUrl,
      coverUrl:
        item.coverUrl ||
        (found.imageTag
          ? buildPublicPosterUrl(found.id, found.imageTag)
          : null),
    };
  } catch (error) {
    console.error("[wecom] enrich item failed", item.name, error);
    return item;
  }
}

async function maybeSendCoverImage(item: LibraryNotifyItem): Promise<boolean> {
  if (!item.embyId && !item.coverUrl) return false;
  try {
    let body: ArrayBuffer | null = null;
    if (item.embyId) {
      // 压到约 480 高，控制在 2MB 内
      const image = await fetchEmbyPrimaryImage(item.embyId, item.imageTag, {
        maxHeight: 480,
        quality: 80,
      });
      body = image?.body ?? null;
    }
    if (!body) return false;
    const result = await sendWecomImage(body);
    if (!result.ok) {
      console.error("[wecom] cover image failed", result.errmsg);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[wecom] cover image error", error);
    return false;
  }
}

function embyTypeLabel(type?: string): string {
  switch (type) {
    case "Movie":
      return "电影";
    case "Series":
      return "剧集";
    case "Season":
      return "季";
    case "Episode":
      return "单集";
    default:
      return type || "媒体";
  }
}

function formatNow(): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
