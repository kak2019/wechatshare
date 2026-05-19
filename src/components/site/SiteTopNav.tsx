"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function navClass(active: boolean) {
  return [
    "text-xs font-medium transition-colors hover:text-[var(--foreground)]",
    active ? "text-[var(--foreground)]" : "text-[var(--mute)]",
  ].join(" ");
}

const TIME_LINKS: Array<{ href: string; label: string }> = [
  { href: "/#counter", label: "倒数日" },
  { href: "/#timeline", label: "时间轴" },
  { href: "/#polaroids", label: "照片墙" },
  { href: "/#map", label: "足迹地图" },
  { href: "/#wishlist", label: "心愿清单" },
];

export function SiteTopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-black/[0.06] bg-[var(--background)]/72 backdrop-blur-xl backdrop-saturate-150"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-70"
        >
          我俩的时光
        </Link>
        <nav className="flex flex-nowrap items-center justify-end gap-x-3 md:flex-wrap md:gap-x-5 md:gap-y-1">
          <Link
            href="/#story"
            className={`hidden md:block ${navClass(pathname === "/")}`}
          >
            故事
          </Link>
          <Link
            href="/#moments"
            className={`hidden md:block ${navClass(pathname === "/")}`}
          >
            瞬间
          </Link>

          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={[
                "flex items-center gap-1 text-xs font-medium transition-colors hover:text-[var(--foreground)]",
                open ? "text-[var(--foreground)]" : "text-[var(--mute)]",
              ].join(" ")}
              aria-haspopup="true"
              aria-expanded={open}
            >
              时光
              <span
                className="text-[8px] transition-transform"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
              >
                ▼
              </span>
            </button>
            <motion.div
              className="absolute left-1/2 top-[calc(100%+10px)] z-50 w-40 -translate-x-1/2 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.06]"
              initial={false}
              animate={{
                opacity: open ? 1 : 0,
                y: open ? 0 : -6,
                pointerEvents: open ? "auto" : "none",
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {TIME_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-xl px-3 py-2 text-sm text-[#3a3a3c] transition-colors hover:bg-amber-50 hover:text-[#1d1d1f]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </motion.div>
          </div>

          <Link
            href="/#playlist"
            className={`hidden md:block ${navClass(pathname === "/")}`}
          >
            歌单
          </Link>
          <Link
            href="/letters"
            className={navClass(pathname === "/letters")}
          >
            信箱
          </Link>
          <Link href="/library" className={navClass(pathname === "/library")}>
            影视库
          </Link>
          <Link
            href="/share"
            className={`hidden md:block ${navClass(pathname === "/share")}`}
          >
            分享
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
