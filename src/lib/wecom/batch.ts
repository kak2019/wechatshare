import type { LibraryNotifyItem } from "@/lib/wecom/notify";

type BufferState = {
  items: LibraryNotifyItem[];
  timer: ReturnType<typeof setTimeout> | null;
};

const FLUSH_MS = 45_000;
const MAX_BATCH = 20;

const globalForWecom = globalThis as unknown as {
  __wecomLibraryBuffer?: BufferState;
};

function getBuffer(): BufferState {
  if (!globalForWecom.__wecomLibraryBuffer) {
    globalForWecom.__wecomLibraryBuffer = { items: [], timer: null };
  }
  return globalForWecom.__wecomLibraryBuffer;
}

function itemKey(item: LibraryNotifyItem): string {
  return `${item.type || ""}::${item.embyId || ""}::${item.seriesName || ""}::${item.name}::${item.year || ""}`;
}

/** 把新媒体加入缓冲，一段时间后合并成一条企业微信通知，避免一集一条刷屏 */
export function enqueueLibraryNotify(
  item: LibraryNotifyItem,
  flush: (items: LibraryNotifyItem[]) => Promise<void>,
): void {
  // 单集太多，只保留 Movie / Series / Season
  if (item.type === "Episode") return;

  const buf = getBuffer();
  const key = itemKey(item);
  if (buf.items.some((x) => itemKey(x) === key)) return;
  buf.items.push(item);

  if (buf.timer) clearTimeout(buf.timer);
  buf.timer = setTimeout(() => {
    void (async () => {
      const batch = buf.items.splice(0, MAX_BATCH);
      buf.timer = null;
      if (!batch.length) return;
      try {
        await flush(batch);
      } catch (error) {
        console.error("[wecom] flush failed", error);
      }
    })();
  }, FLUSH_MS);
}
