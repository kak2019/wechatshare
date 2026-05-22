import type { Metadata } from "next";

import { FishingGameClient } from "@/components/fish/FishingGameClient";
import { SiteTopNav } from "@/components/site/SiteTopNav";
import { SITE_META } from "@/content/site";

export const metadata: Metadata = {
  title: SITE_META.fish.title,
  description: SITE_META.fish.description,
};

export default function FishPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteTopNav />
      <main>
        <FishingGameClient />
      </main>
    </div>
  );
}
