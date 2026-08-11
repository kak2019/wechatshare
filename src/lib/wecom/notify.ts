const DEFAULT_WEBHOOK =
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=636eff2e-94fd-4a5f-9bca-f89e9b94badf";

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

export type WecomMessage = WecomTextMessage | WecomMarkdownMessage;

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

/** 刮削入库完成通知（批量摘要） */
export async function notifyLibraryIngest(input: {
  title?: string;
  items?: string[];
  note?: string;
}): Promise<{ ok: boolean; errmsg: string }> {
  const title = input.title?.trim() || "仙女的浪漫小屋影业 · 新剧入库";
  const items = (input.items || []).map((s) => s.trim()).filter(Boolean);
  const note = input.note?.trim();

  const lines = [
    `## ${title}`,
    "",
    items.length
      ? items.map((name, i) => `${i + 1}. **${name}**`).join("\n")
      : "本次入库已完成。",
  ];
  if (note) {
    lines.push("", `> ${note}`);
  }
  lines.push("", `_刮削入库通知 · ${formatNow()}_`);

  return sendWecomMessage({
    msgtype: "markdown",
    markdown: { content: lines.join("\n") },
  });
}

/** 单条新媒体通知（Emby library.new） */
export function formatEmbyNewItemMarkdown(item: {
  name: string;
  type?: string;
  year?: number | string | null;
  seriesName?: string | null;
  seasonName?: string | null;
  indexNumber?: number | null;
  parentIndexNumber?: number | null;
}): string {
  const typeLabel = embyTypeLabel(item.type);
  const titleBits = [item.seriesName, item.seasonName, item.name].filter(
    Boolean,
  );
  const display =
    item.type === "Episode" && item.seriesName
      ? `${item.seriesName} · ${formatEpisodeCode(item.parentIndexNumber, item.indexNumber)} ${item.name}`
      : titleBits[titleBits.length - 1] || item.name;

  const meta = [typeLabel, item.year ? String(item.year) : null]
    .filter(Boolean)
    .join(" · ");

  return [
    `## 仙女的浪漫小屋影业 · 新片上架`,
    "",
    `**${display}**`,
    meta ? `\n${meta}` : "",
    "",
    `_Emby 自动通知 · ${formatNow()}_`,
  ]
    .filter(Boolean)
    .join("\n");
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

function formatEpisodeCode(
  season?: number | null,
  episode?: number | null,
): string {
  const s = season != null ? `S${String(season).padStart(2, "0")}` : "";
  const e = episode != null ? `E${String(episode).padStart(2, "0")}` : "";
  return `${s}${e}`.trim();
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
