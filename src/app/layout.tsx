import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Caveat, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/site/SiteFooter";
import { GlobalEasterEggs } from "@/components/site/GlobalEasterEggs";
import { PwaInstallHint } from "@/components/site/PwaInstallHint";
import { PwaRegister } from "@/components/site/PwaRegister";
import { PWA, SITE_META } from "@/content/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const maShanZheng = Ma_Shan_Zheng({
  variable: "--font-hand-zh",
  weight: ["400"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: SITE_META.default.title,
  description: SITE_META.default.description,
  applicationName: PWA.shortName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PWA.shortName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: PWA.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${maShanZheng.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <GlobalEasterEggs />
        <PwaRegister />
        <PwaInstallHint />
      </body>
    </html>
  );
}
