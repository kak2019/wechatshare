import type { Metadata } from "next";

import { ChatClient } from "@/components/ai-chat/ChatClient";
import { SiteTopNav } from "@/components/site/SiteTopNav";
import { SITE_META } from "@/content/site";

export const metadata: Metadata = {
  title: SITE_META.chat.title,
  description: SITE_META.chat.description,
};

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <SiteTopNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <ChatClient />
      </main>
    </div>
  );
}
