"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function TopNav() {
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
        <nav className="flex items-center gap-8 text-xs font-medium text-[#6e6e73]">
          <a href="#story" className="transition-colors hover:text-[#1d1d1f]">
            故事
          </a>
          <a href="#moments" className="transition-colors hover:text-[#1d1d1f]">
            瞬间
          </a>
          <Link href="/share" className="transition-colors hover:text-[#1d1d1f]">
            分享
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
