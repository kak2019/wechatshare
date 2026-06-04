import type { Metadata } from "next";

import { RoundtableClient } from "@/components/tuanzi/RoundtableClient";
import { SiteTopNav } from "@/components/site/SiteTopNav";
import { SITE_META } from "@/content/site";

export const metadata: Metadata = {
  title: SITE_META.tuanzi.title,
  description: SITE_META.tuanzi.description,
};

export default function TuanziPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteTopNav />
      <main>
        <RoundtableClient />
      </main>
    </div>
  );
}
