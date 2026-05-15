import type { Metadata } from "next";

import { LetterboxClient } from "@/components/letters/LetterboxClient";
import { SiteTopNav } from "@/components/site/SiteTopNav";

export const metadata: Metadata = {
  title: "悄悄话信箱｜我俩的时光",
  description: "翻一封信，听一段心里的话。",
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
