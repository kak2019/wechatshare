import type { Metadata } from "next";

import { LetterboxClient } from "@/components/letters/LetterboxClient";
import { SiteTopNav } from "@/components/site/SiteTopNav";
import { SITE_META } from "@/content/site";

export const metadata: Metadata = {
  title: SITE_META.letters.title,
  description: SITE_META.letters.description,
};

export default function LettersPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteTopNav />
      <main>
        <LetterboxClient />
      </main>
    </div>
  );
}
