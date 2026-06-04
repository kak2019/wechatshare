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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] lg:flex lg:flex-col lg:overflow-hidden">
      <SiteTopNav />
      <main className="lg:min-h-0 lg:flex-1">
        <RoundtableClient />
      </main>
    </div>
  );
}
