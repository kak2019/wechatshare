import type { Metadata } from "next";

import { EmbyLibraryClient } from "@/components/library/EmbyLibraryClient";
import {
  fetchEmbyPosterWall,
  getEmbyOpenHomeUrl,
  type EmbyWallItem,
} from "@/lib/emby/client";

export const metadata: Metadata = {
  title: "放映厅｜我俩的时光",
  description: "和喜欢的人一起打开 Emby 私人影视库。",
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  let items: EmbyWallItem[] = [];
  let error: string | null = null;

  try {
    items = await fetchEmbyPosterWall(24);
  } catch (err) {
    error = err instanceof Error ? err.message : "暂时连不上放映厅";
  }

  return (
    <EmbyLibraryClient
      initialItems={items}
      openHomeUrl={getEmbyOpenHomeUrl()}
      initialError={error}
    />
  );
}
