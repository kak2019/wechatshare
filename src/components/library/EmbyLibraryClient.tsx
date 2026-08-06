"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { SiteTopNav } from "@/components/site/SiteTopNav";
import { LIBRARY_PAGE } from "@/content/site";
import type { EmbyPlayInfo, EmbyWallItem } from "@/lib/emby/types";

type EmbyLibraryClientProps = {
  initialItems: EmbyWallItem[];
  openHomeUrl: string;
  initialError?: string | null;
};

const easeApple = [0.22, 1, 0.36, 1] as [number, number, number, number];

function typeLabel(type: string): string {
  switch (type) {
    case "Movie":
      return "电影";
    case "Series":
      return "剧集";
    case "Episode":
      return "单集";
    default:
      return "影片";
  }
}

export function EmbyLibraryClient({
  initialItems,
  openHomeUrl,
  initialError = null,
}: EmbyLibraryClientProps) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(
    initialItems.length === 0 && !initialError,
  );
  const [playing, setPlaying] = useState<EmbyPlayInfo | null>(null);
  const [playLoading, setPlayLoading] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    if (initialItems.length > 0 || initialError) return;

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/emby/wall");
        const data = (await res.json()) as {
          items?: EmbyWallItem[];
          error?: string;
        };
        if (cancelled) return;
        setItems(data.items || []);
        setError(data.error || null);
      } catch {
        if (!cancelled) setError("暂时连不上放映厅");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialItems.length, initialError]);

  useEffect(() => {
    if (!playing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPlaying(null);
        setPlayError(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  async function playItem(item: EmbyWallItem) {
    setPlayLoading(true);
    setPlayError(null);
    try {
      const res = await fetch(`/api/emby/play/${encodeURIComponent(item.id)}`);
      const data = (await res.json()) as EmbyPlayInfo & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "无法开始播放");
      }
      setPlaying(data);
    } catch (err) {
      setPlayError(err instanceof Error ? err.message : "无法开始播放");
      setPlaying(null);
    } finally {
      setPlayLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1d1d1f]">
      <SiteTopNav />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeApple }}
        >
          <p className="text-center text-xs font-medium uppercase tracking-[0.35em] text-[#6e6e73]">
            {LIBRARY_PAGE.eyebrow}
          </p>
          <h1 className="mt-5 text-center text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]">
            {LIBRARY_PAGE.heading}
            <span className="block bg-gradient-to-r from-amber-500/90 via-orange-500/85 to-rose-500/80 bg-clip-text text-transparent">
              {LIBRARY_PAGE.headingAccent}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-[#6e6e73] sm:text-lg">
            {LIBRARY_PAGE.body}
          </p>
        </motion.div>

        {loading ? (
          <p className="mt-16 text-center text-sm text-[#6e6e73]">
            {LIBRARY_PAGE.loading}
          </p>
        ) : null}

        {!loading && error && items.length === 0 ? (
          <p className="mt-16 text-center text-sm text-[#6e6e73]">{error}</p>
        ) : null}

        {playError ? (
          <p className="mt-8 text-center text-sm text-rose-600">{playError}</p>
        ) : null}

        {!loading && items.length > 0 ? (
          <motion.ul
            className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {items.map((item) => (
              <motion.li
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, ease: easeApple },
                  },
                }}
              >
                <button
                  type="button"
                  onClick={() => void playItem(item)}
                  disabled={playLoading}
                  className="group block w-full overflow-hidden rounded-2xl bg-[#1d1d1f] text-left shadow-[0_16px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-transform hover:scale-[1.02] active:scale-[0.99] disabled:opacity-70"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#2c2c2e]">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.posterUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-3 text-center text-sm text-white/60">
                        {item.name}
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1d1d1f]">
                        {LIBRARY_PAGE.playHint}
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-3 pb-3 pt-10">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                        {typeLabel(item.type)}
                        {item.year ? ` · ${item.year}` : ""}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white">
                        {item.name}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        ) : null}

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.65, ease: easeApple }}
        >
          <a
            href={openHomeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-black/[0.08] bg-white px-6 py-2.5 text-sm font-medium text-[#1d1d1f] shadow-[0_2px_24px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {LIBRARY_PAGE.openExternal}
          </a>
        </motion.div>
      </main>

      <AnimatePresence>
        {playing ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setPlaying(null);
              setPlayError(null);
            }}
          >
            <motion.div
              className="relative w-full max-w-5xl overflow-hidden rounded-[24px] bg-[#111] shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: easeApple }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
                <div>
                  <p className="text-base font-semibold text-white sm:text-lg">
                    {playing.title}
                  </p>
                  {playing.subtitle ? (
                    <p className="mt-1 text-sm text-white/55">{playing.subtitle}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-white/40">
                    {LIBRARY_PAGE.playBufferHint}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(null);
                    setPlayError(null);
                  }}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/15"
                >
                  {LIBRARY_PAGE.closePlayer}
                </button>
              </div>
              <video
                key={playing.streamUrl}
                className="aspect-video w-full bg-black"
                src={playing.streamUrl}
                controls
                autoPlay
                playsInline
                preload="auto"
              />
              <div className="px-5 py-4 sm:px-6">
                <a
                  href={playing.openUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/55 underline-offset-4 transition hover:text-white hover:underline"
                >
                  {LIBRARY_PAGE.openInEmby}
                </a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
