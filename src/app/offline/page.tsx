import Link from "next/link";

import { PWA } from "@/content/site";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#fafafa] px-6 text-center text-[#1d1d1f]">
      <p className="text-4xl">📖</p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {PWA.offlineTitle}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#6e6e73]">
        {PWA.offlineBody}
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[#1d1d1f] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
      >
        {PWA.offlineAction}
      </Link>
    </div>
  );
}
