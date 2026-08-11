#!/usr/bin/env node
/**
 * 刮削入库完成后发企业微信通知（markdown_v2；有片名会尽量配封面）
 * 用法：
 *   npm run notify:library -- "黑袍纠察队" "老友记"
 *   npm run notify:library -- --note "已从 Source 移入已整理" "剑来"
 *
 * 优先走站点 API（服务端可拉 Emby 封面）；失败则直接打 Webhook 纯文案。
 */

const WEBHOOK =
  process.env.WECOM_WEBHOOK_URL ||
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=636eff2e-94fd-4a5f-9bca-f89e9b94badf";

const SITE_ORIGIN = (
  process.env.SITE_ORIGIN ||
  process.env.NEXT_PUBLIC_SITE_ORIGIN ||
  "https://flynt.top"
).replace(/\/$/, "");

const args = process.argv.slice(2);
let note = "";
let title = "仙女的浪漫小屋影业 · 新剧入库";
const names = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--note") {
    note = args[++i] || "";
    continue;
  }
  if (args[i] === "--title") {
    title = args[++i] || title;
    continue;
  }
  if (args[i]?.trim()) names.push(args[i].trim());
}

const payload = {
  title,
  items: names,
  note: note || undefined,
};

async function viaSiteApi() {
  const headers = { "Content-Type": "application/json" };
  const secret = process.env.NOTIFY_SECRET?.trim();
  if (secret) headers["x-notify-secret"] = secret;

  const res = await fetch(`${SITE_ORIGIN}/api/notify/library`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false || data.errcode) {
    throw new Error(data.errmsg || data.error || `HTTP ${res.status}`);
  }
  return data;
}

async function viaWebhookFallback() {
  const lines = [
    `# ${title}`,
    "",
    names.length
      ? names.map((n, i) => `${i + 1}. **${n}**`).join("\n")
      : "本次入库已完成。",
  ];
  if (note) lines.push("", `> ${note}`);
  lines.push(
    "",
    `_刮削入库通知 · ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}_`,
  );

  const res = await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msgtype: "markdown_v2",
      markdown_v2: { content: lines.join("\n") },
    }),
  });
  const data = await res.json();
  if (data.errcode) throw new Error(data.errmsg || JSON.stringify(data));
  return data;
}

try {
  const data = await viaSiteApi().catch(async (err) => {
    console.warn("site api failed, fallback webhook:", err.message || err);
    return viaWebhookFallback();
  });
  console.log("ok", names.length ? names.join(", ") : "(empty summary)", data);
} catch (error) {
  console.error(error);
  process.exit(1);
}
