import type { Metadata } from "next";

import { EmbyLibraryClient } from "@/components/library/EmbyLibraryClient";

/** 与你的 Emby 实际监听一致；主站 https://flynt.top 若直接嵌 http 可能被浏览器混合内容拦截，见页面说明。 */
const DEFAULT_EMBY_URL = "http://app.flynt.top:8096";

function normalizeEmbUrl(raw?: string): string {
  const fromEnv = raw?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_EMBY_URL;
  if (/^https?:\/\//i.test(base)) {
    return base;
  }
  /** 未写协议时默认 HTTP，便于 :8096 明文 Emby；若已给 Emby 配好 HTTPS，请在环境变量里写完整 https://… */
  return `http://${base}`;
}

export const metadata: Metadata = {
  title: "放映厅｜我俩的时光",
  description: "和喜欢的人一起打开 Emby 私人影视库。",
};

export default function LibraryPage() {
  const embyUrl = normalizeEmbUrl(process.env.NEXT_PUBLIC_EMBY_URL);
  return <EmbyLibraryClient embyUrl={embyUrl} />;
}
