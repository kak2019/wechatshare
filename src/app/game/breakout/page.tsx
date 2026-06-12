import type { Metadata } from "next";

import { BreakoutGameClient } from "@/components/breakout/BreakoutGameClient";
import { SiteTopNav } from "@/components/site/SiteTopNav";
import { SITE_META } from "@/content/site";

export const metadata: Metadata = {
  title: SITE_META.breakout.title,
  description: SITE_META.breakout.description,
};

export default function BreakoutPage() {
  return (
    <>
      <SiteTopNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <BreakoutGameClient />
      </main>
    </>
  );
}
