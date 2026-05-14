import type { Metadata } from "next";

import { EmbyLibraryClient } from "@/components/library/EmbyLibraryClient";

const DEFAULT_EMBY_HOST = "app.flynt.top:8096";

function normalizeEmbUrl(raw?: string): string {
  const fromEnv = raw?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_EMBY_HOST;
  if (/^https?:\/\//i.test(base)) {
    return base;
  }
  return `https://${base}`;
}

export const metadata: Metadata = {
  title: "放映厅｜我俩的时光",
  description: "和喜欢的人一起打开 Emby 私人影视库。",
};

export default function LibraryPage() {
  const embyUrl = normalizeEmbUrl(process.env.NEXT_PUBLIC_EMBY_URL);
  return <EmbyLibraryClient embyUrl={embyUrl} />;
}
