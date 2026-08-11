#!/usr/bin/env node
/**
 * 刮削入库完成后发企业微信通知
 * 用法：
 *   npm run notify:library -- "黑袍纠察队 S5" "老友记"
 *   npm run notify:library -- --note "已从 Source 移入已整理" "剑来"
 */

const WEBHOOK =
  process.env.WECOM_WEBHOOK_URL ||
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=636eff2e-94fd-4a5f-9bca-f89e9b94badf";

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

const lines = [
  `## ${title}`,
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
    msgtype: "markdown",
    markdown: { content: lines.join("\n") },
  }),
});
const data = await res.json();
if (data.errcode) {
  console.error(data);
  process.exit(1);
}
console.log("ok", names.length ? names.join(", ") : "(empty summary)");
