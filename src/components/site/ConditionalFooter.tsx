"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site/SiteFooter";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/game")) return null;
  return <SiteFooter />;
}
