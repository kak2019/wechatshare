import type { EmbyPlayInfo, EmbyWallItem } from "@/lib/emby/types";
import { spawn } from "node:child_process";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { Readable } from "node:stream";

const DEFAULT_EMBY_URL = "https://emby.arya.beer";
const DEFAULT_EMBY_USER = "admin";
const DEFAULT_EMBY_PASSWORD = "xx123456";

const CLIENT = "OurTime";
const DEVICE = "LoveJournal";
const DEVICE_ID = "our-time-library";
const VERSION = "1.0.0";

export type { EmbyPlayInfo, EmbyWallItem };

type AuthCache = {
  token: string;
  userId: string;
  serverId: string;
  expiresAt: number;
};

let authCache: AuthCache | null = null;

export function getEmbyBaseUrl(): string {
  const raw = process.env.EMBY_URL?.trim() || DEFAULT_EMBY_URL;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

function getCredentials() {
  return {
    username: process.env.EMBY_USER?.trim() || DEFAULT_EMBY_USER,
    password: process.env.EMBY_PASSWORD?.trim() || DEFAULT_EMBY_PASSWORD,
  };
}

function authHeader(token?: string): string {
  const parts = [
    `MediaBrowser Client="${CLIENT}"`,
    `Device="${DEVICE}"`,
    `DeviceId="${DEVICE_ID}"`,
    `Version="${VERSION}"`,
  ];
  if (token) parts.push(`Token="${token}"`);
  return parts.join(", ");
}

async function authenticate(force = false): Promise<AuthCache> {
  if (
    !force &&
    authCache &&
    authCache.expiresAt > Date.now() + 60_000
  ) {
    return authCache;
  }

  const base = getEmbyBaseUrl();
  const { username, password } = getCredentials();

  const res = await fetch(`${base}/Users/AuthenticateByName`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Emby-Authorization": authHeader(),
    },
    body: JSON.stringify({ Username: username, Pw: password }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Emby 登录失败（${res.status}）`);
  }

  const data = (await res.json()) as {
    AccessToken: string;
    User: { Id: string; ServerId?: string };
    ServerId?: string;
  };

  authCache = {
    token: data.AccessToken,
    userId: data.User.Id,
    serverId: data.ServerId || data.User.ServerId || "",
    // Emby token 通常较久；本地缓存 6 小时，过期再登
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
  };
  return authCache;
}

async function embyFetch(path: string, init?: RequestInit): Promise<Response> {
  const auth = await authenticate();
  const base = getEmbyBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "X-Emby-Token": auth.token,
      "X-Emby-Authorization": authHeader(auth.token),
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    await authenticate(true);
    const retryAuth = await authenticate();
    return fetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        "X-Emby-Token": retryAuth.token,
        "X-Emby-Authorization": authHeader(retryAuth.token),
      },
      cache: "no-store",
    });
  }

  return res;
}

type EmbyItem = {
  Id: string;
  Name: string;
  Type?: string;
  ProductionYear?: number;
  Overview?: string;
  ServerId?: string;
  SeriesName?: string;
  ParentIndexNumber?: number;
  IndexNumber?: number;
  ImageTags?: { Primary?: string };
};

type PlaybackMediaSource = {
  Id: string;
  Container?: string;
  DirectStreamUrl?: string;
  Path?: string;
};

function toWallItem(item: EmbyItem, serverId: string, base: string): EmbyWallItem {
  const imageTag = item.ImageTags?.Primary ?? null;
  const sid = item.ServerId || serverId;
  return {
    id: item.Id,
    name: item.Name,
    type: item.Type || "Item",
    year: item.ProductionYear ?? null,
    overview: item.Overview ?? null,
    serverId: sid,
    hasPrimaryImage: Boolean(imageTag),
    imageTag,
    openUrl: `${base}/web/index.html#!/item?id=${encodeURIComponent(item.Id)}&serverId=${encodeURIComponent(sid)}`,
    posterUrl: imageTag
      ? `/api/emby/image/${encodeURIComponent(item.Id)}?tag=${encodeURIComponent(imageTag)}`
      : null,
  };
}

export async function fetchEmbyPosterWall(limit = 24): Promise<EmbyWallItem[]> {
  const auth = await authenticate();
  const base = getEmbyBaseUrl();
  const params = new URLSearchParams({
    Limit: String(limit),
    Fields: "Overview,PrimaryImageAspectRatio,ProductionYear",
  });

  const res = await embyFetch(
    `/Users/${auth.userId}/Items/Latest?${params.toString()}`,
  );

  if (!res.ok) {
    throw new Error(`拉取 Emby 海报失败（${res.status}）`);
  }

  const data = (await res.json()) as EmbyItem[] | { Items?: EmbyItem[] };
  const items = Array.isArray(data) ? data : data.Items || [];
  return items.map((item) => toWallItem(item, auth.serverId, base));
}

export async function fetchEmbyPrimaryImage(
  itemId: string,
  tag?: string | null,
  opts?: { maxHeight?: number; quality?: number },
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const params = new URLSearchParams({
    maxHeight: String(opts?.maxHeight ?? 720),
    quality: String(opts?.quality ?? 90),
  });
  if (tag) params.set("tag", tag);

  const res = await embyFetch(
    `/Items/${encodeURIComponent(itemId)}/Images/Primary?${params.toString()}`,
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`拉取海报图失败（${res.status}）`);
  }

  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") || "image/jpeg",
  };
}

/** 通知用：按 ID 取条目元数据（含海报 tag / 简介） */
export async function fetchEmbyItemMeta(itemId: string): Promise<{
  id: string;
  name: string;
  type: string;
  year: number | null;
  overview: string | null;
  seriesName: string | null;
  imageTag: string | null;
  openUrl: string;
} | null> {
  try {
    const auth = await authenticate();
    const base = getEmbyBaseUrl();
    const res = await embyFetch(
      `/Users/${auth.userId}/Items/${encodeURIComponent(itemId)}?Fields=Overview,PrimaryImageAspectRatio,ProductionYear,SeriesName`,
    );
    if (!res.ok) return null;
    const item = (await res.json()) as EmbyItem;
    const wall = toWallItem(item, auth.serverId, base);
    return {
      id: wall.id,
      name: wall.name,
      type: wall.type,
      year: wall.year,
      overview: wall.overview,
      seriesName: item.SeriesName ?? null,
      imageTag: wall.imageTag,
      openUrl: wall.openUrl,
    };
  } catch {
    return null;
  }
}

/** 按片名在 Emby 里搜电影/剧集（入库通知补封面用） */
export async function searchEmbyByName(
  name: string,
  includeTypes: string[] = ["Movie", "Series"],
): Promise<{
  id: string;
  name: string;
  type: string;
  year: number | null;
  overview: string | null;
  imageTag: string | null;
  openUrl: string;
} | null> {
  const q = name.trim();
  if (!q) return null;
  try {
    const auth = await authenticate();
    const base = getEmbyBaseUrl();
    const params = new URLSearchParams({
      SearchTerm: q,
      Recursive: "true",
      IncludeItemTypes: includeTypes.join(","),
      Fields: "Overview,PrimaryImageAspectRatio,ProductionYear",
      Limit: "8",
    });
    const res = await embyFetch(
      `/Users/${auth.userId}/Items?${params.toString()}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { Items?: EmbyItem[] };
    const items = data.Items || [];
    if (!items.length) return null;

    const lower = q.toLowerCase();
    const exact =
      items.find((it) => it.Name?.toLowerCase() === lower) ||
      items.find((it) => it.Name?.toLowerCase().includes(lower)) ||
      items[0];
    const wall = toWallItem(exact, auth.serverId, base);
    return {
      id: wall.id,
      name: wall.name,
      type: wall.type,
      year: wall.year,
      overview: wall.overview,
      imageTag: wall.imageTag,
      openUrl: wall.openUrl,
    };
  } catch {
    return null;
  }
}

/** 站点公网海报代理地址（企微 markdown_v2 可嵌图） */
export function buildPublicPosterUrl(
  itemId: string,
  tag?: string | null,
  siteOrigin?: string,
): string {
  const origin = (
    siteOrigin ||
    process.env.SITE_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() ||
    "https://flynt.top"
  ).replace(/\/$/, "");
  const qs = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  return `${origin}/api/emby/image/${encodeURIComponent(itemId)}${qs}`;
}

function browserHeaders(token: string): Record<string, string> {
  return {
    "X-Emby-Token": token,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: `${getEmbyBaseUrl()}/web/index.html`,
    Accept: "*/*",
  };
}

async function fetchItem(itemId: string): Promise<EmbyItem> {
  const auth = await authenticate();
  const res = await embyFetch(
    `/Users/${auth.userId}/Items/${encodeURIComponent(itemId)}?Fields=Overview,PrimaryImageAspectRatio,ProductionYear`,
  );
  if (!res.ok) throw new Error(`找不到影片（${res.status}）`);
  return (await res.json()) as EmbyItem;
}

async function resolvePlayableItem(itemId: string): Promise<{
  item: EmbyItem;
  playItem: EmbyItem;
  title: string;
  subtitle: string | null;
}> {
  const auth = await authenticate();
  const item = await fetchItem(itemId);

  if (item.Type === "Episode" || item.Type === "Movie" || item.Type === "Video") {
    const title = item.SeriesName
      ? `${item.SeriesName}`
      : item.Name;
    const subtitle = item.SeriesName
      ? [
          item.ParentIndexNumber != null ? `S${item.ParentIndexNumber}` : null,
          item.IndexNumber != null ? `E${item.IndexNumber}` : null,
          item.Name,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;
    return { item, playItem: item, title, subtitle };
  }

  if (item.Type === "Series") {
    const nextRes = await embyFetch(
      `/Shows/NextUp?UserId=${auth.userId}&SeriesId=${encodeURIComponent(item.Id)}&Limit=1`,
    );
    let playItem: EmbyItem | null = null;
    if (nextRes.ok) {
      const nextData = (await nextRes.json()) as { Items?: EmbyItem[] };
      playItem = nextData.Items?.[0] ?? null;
    }
    if (!playItem) {
      const epRes = await embyFetch(
        `/Shows/${encodeURIComponent(item.Id)}/Episodes?UserId=${auth.userId}&Limit=1`,
      );
      if (!epRes.ok) throw new Error("这部剧暂时没有可播放的集");
      const epData = (await epRes.json()) as { Items?: EmbyItem[] };
      playItem = epData.Items?.[0] ?? null;
    }
    if (!playItem) throw new Error("这部剧暂时没有可播放的集");

    const subtitle = [
      playItem.ParentIndexNumber != null ? `S${playItem.ParentIndexNumber}` : null,
      playItem.IndexNumber != null ? `E${playItem.IndexNumber}` : null,
      playItem.Name,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      item,
      playItem,
      title: item.Name,
      subtitle: subtitle || null,
    };
  }

  throw new Error("这类内容暂不支持站内播放");
}

async function resolveEmbyStreamUrl(playId: string): Promise<{
  embyStreamUrl: string;
  mediaSourceId: string;
  container: string | null;
}> {
  const auth = await authenticate();
  const base = getEmbyBaseUrl();
  const pbRes = await embyFetch(
    `/Items/${encodeURIComponent(playId)}/PlaybackInfo?UserId=${auth.userId}&IsPlayback=true&AutoOpenLiveStream=true`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
  );
  if (!pbRes.ok) throw new Error(`无法准备播放（${pbRes.status}）`);

  const pb = (await pbRes.json()) as { MediaSources?: PlaybackMediaSource[] };
  const ms = pb.MediaSources?.[0];
  if (!ms?.DirectStreamUrl) throw new Error("没有可用的播放源");

  const embyStreamUrl = ms.DirectStreamUrl.startsWith("http")
    ? ms.DirectStreamUrl
    : `${base}${ms.DirectStreamUrl}`;

  return {
    embyStreamUrl,
    mediaSourceId: ms.Id,
    container: ms.Container ?? null,
  };
}

function parseRangeHeader(
  rangeHeader: string | undefined,
  size: number,
): { start: number; end: number } | null {
  if (!rangeHeader) return { start: 0, end: size - 1 };
  const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!m) return null;
  const start = m[1] ? Number(m[1]) : 0;
  const end = m[2] ? Number(m[2]) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return null;
  return { start, end: Math.min(end, size - 1) };
}

async function fetchEmbyByteRange(
  embyStreamUrl: string,
  token: string,
  start: number,
  end: number,
): Promise<{ body: Buffer; size: number }> {
  const headers = browserHeaders(token);
  // 115 签名常见 50MB 上限
  const maxSpan = 32 * 1024 * 1024 - 1;
  if (end - start > maxSpan) {
    end = start + maxSpan;
  }
  const range = `bytes=${start}-${end}`;

  const bounce = await fetch(embyStreamUrl, {
    redirect: "manual",
    headers: { ...headers, Range: range },
    cache: "no-store",
  });

  const location = bounce.headers.get("location");
  const upstream =
    bounce.status >= 300 && bounce.status < 400 && location
      ? await fetch(location, {
          headers: { ...headers, Range: range },
          cache: "no-store",
        })
      : bounce;

  if (upstream.status !== 206 && upstream.status !== 200) {
    const detail = await upstream.text().catch(() => "");
    throw new Error(`读取影片失败（${upstream.status}）${detail.slice(0, 80)}`);
  }

  const cr = upstream.headers.get("content-range");
  const sizeMatch = cr ? /\/(\d+)\s*$/.exec(cr) : null;
  const size = sizeMatch ? Number(sizeMatch[1]) : end + 1;
  const body = Buffer.from(await upstream.arrayBuffer());
  return { body, size };
}

async function createEmbyMediaProxy(
  embyStreamUrl: string,
  token: string,
): Promise<{ port: number; close: () => Promise<void>; size: number }> {
  const probe = await fetchEmbyByteRange(embyStreamUrl, token, 0, 0);
  const size = probe.size;
  if (!size || size < 2) throw new Error("无法获取影片大小");

  const server = http.createServer((req, res) => {
    void (async () => {
      try {
        if (req.method === "HEAD") {
          res.writeHead(200, {
            "Content-Length": String(size),
            "Accept-Ranges": "bytes",
            "Content-Type": "application/octet-stream",
          });
          res.end();
          return;
        }

        if (req.method !== "GET") {
          res.writeHead(405);
          res.end();
          return;
        }

        const parsed = parseRangeHeader(req.headers.range, size);
        if (!parsed) {
          res.writeHead(416, { "Content-Range": `bytes */${size}` });
          res.end();
          return;
        }

        // 对 ffmpeg 的大跨度 Range，按块拼接写出；客户端断开即停
        const chunkSpan = 32 * 1024 * 1024;
        let start = parsed.start;
        const finalEnd = parsed.end;
        const totalLen = finalEnd - parsed.start + 1;
        let aborted = false;
        req.on("close", () => {
          aborted = true;
        });

        res.writeHead(req.headers.range ? 206 : 200, {
          "Content-Type": "application/octet-stream",
          "Accept-Ranges": "bytes",
          "Content-Length": String(totalLen),
          ...(req.headers.range
            ? { "Content-Range": `bytes ${parsed.start}-${finalEnd}/${size}` }
            : {}),
        });

        while (start <= finalEnd && !aborted) {
          const end = Math.min(start + chunkSpan - 1, finalEnd);
          const { body } = await fetchEmbyByteRange(
            embyStreamUrl,
            token,
            start,
            end,
          );
          if (aborted) break;
          if (!res.write(body)) {
            await new Promise<void>((resolve) => res.once("drain", resolve));
          }
          start = end + 1;
        }
        res.end();
      } catch (error) {
        console.error("[emby-proxy]", error);
        if (!res.headersSent) res.writeHead(502);
        res.end("bad gateway");
      }
    })();
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const port = (server.address() as AddressInfo).port;

  return {
    port,
    size,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

export async function getEmbyPlayInfo(itemId: string): Promise<EmbyPlayInfo> {
  const auth = await authenticate();
  const base = getEmbyBaseUrl();
  const { item, playItem, title, subtitle } = await resolvePlayableItem(itemId);
  const imageTag = item.ImageTags?.Primary ?? playItem.ImageTags?.Primary ?? null;
  const sid = item.ServerId || playItem.ServerId || auth.serverId;

  return {
    itemId: item.Id,
    playId: playItem.Id,
    title,
    subtitle,
    type: item.Type || playItem.Type || "Item",
    streamUrl: `/api/emby/stream/${encodeURIComponent(playItem.Id)}`,
    openUrl: `${base}/web/index.html#!/item?id=${encodeURIComponent(playItem.Id)}&serverId=${encodeURIComponent(sid)}`,
    posterUrl: imageTag
      ? `/api/emby/image/${encodeURIComponent(item.Id)}?tag=${encodeURIComponent(imageTag)}`
      : null,
  };
}

/**
 * 把 Emby/115 片源转成浏览器可播的 fMP4（H.264 + AAC）流。
 * 通过本机可 Range 的代理喂给 ffmpeg，兼容 moov 在文件尾的 MP4。
 */
export async function openEmbyTranscodedStream(playId: string): Promise<{
  stream: ReadableStream<Uint8Array>;
  contentType: string;
}> {
  const auth = await authenticate();
  const { embyStreamUrl } = await resolveEmbyStreamUrl(playId);
  const proxy = await createEmbyMediaProxy(embyStreamUrl, auth.token);

  const ff = spawn(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      `http://127.0.0.1:${proxy.port}/media`,
      "-map",
      "0:v:0",
      "-map",
      "0:a:0?",
      "-sn",
      "-dn",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-maxrate",
      "4M",
      "-bufsize",
      "8M",
      "-vf",
      "scale='min(1280,iw)':-2",
      "-c:a",
      "aac",
      "-ac",
      "2",
      "-b:a",
      "128k",
      "-movflags",
      "frag_keyframe+empty_moov+default_base_moof",
      "-f",
      "mp4",
      "pipe:1",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let stderr = "";
  ff.stderr?.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
    if (stderr.length > 4000) stderr = stderr.slice(-2000);
  });

  const cleanup = () => {
    if (!ff.killed) ff.kill("SIGKILL");
    void proxy.close();
  };

  ff.on("close", (code) => {
    void proxy.close();
    if (code && code !== 0) {
      console.error("[emby-stream] ffmpeg exit", code, stderr.slice(0, 500));
    }
  });

  if (!ff.stdout) {
    cleanup();
    throw new Error("无法启动转码");
  }

  const nodeStream = Readable.toWeb(ff.stdout) as ReadableStream<Uint8Array>;
  const stream = nodeStream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      flush() {
        void proxy.close();
      },
    }),
  );

  return { stream, contentType: "video/mp4" };
}

export function getEmbyOpenHomeUrl(): string {
  return `${getEmbyBaseUrl()}/web/index.html#!/home`;
}
