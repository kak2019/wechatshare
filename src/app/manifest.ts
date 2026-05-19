import type { MetadataRoute } from "next";

import { PWA } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PWA.name,
    short_name: PWA.shortName,
    description: PWA.description,
    start_url: PWA.startUrl,
    scope: PWA.scope,
    display: "standalone",
    orientation: "portrait",
    background_color: PWA.backgroundColor,
    theme_color: PWA.themeColor,
    lang: "zh-CN",
    categories: ["lifestyle", "personalization"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
