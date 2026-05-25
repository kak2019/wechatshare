import type { Metadata } from "next";

import { YangGameClient } from "@/components/yanglegeyang/YangGameClient";
import { SiteTopNav } from "@/components/site/SiteTopNav";
import { SITE_META } from "@/content/site";

export const metadata: Metadata = {
  title: SITE_META.yanglegeyang.title,
  description: SITE_META.yanglegeyang.description,
};

export default function YangLeGeYangPage() {
  return (
    <>
      <SiteTopNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <YangGameClient />
      </main>
    </>
  );
}
