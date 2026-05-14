"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

function navClass(active: boolean) {
  return [
    "text-xs font-medium transition-colors hover:text-[#1d1d1f]",
    active ? "text-[#1d1d1f]" : "text-[#6e6e73]",
  ].join(" ");
}

export function SiteTopNav() {
  const pathname = usePathname();

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fafafa]/72 backdrop-blur-xl backdrop-saturate-150"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-[#1d1d1f] transition-opacity hover:opacity-70"
        >
          我俩的时光
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:justify-end">
          <Link href="/#story" className={navClass(pathname === "/")}>
            故事
          </Link>
          <Link href="/#moments" className={navClass(pathname === "/")}>
            瞬间
          </Link>
          <Link href="/library" className={navClass(pathname === "/library")}>
            影视库
          </Link>
          <Link href="/share" className={navClass(pathname === "/share")}>
            分享
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
