import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Caveat, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/site/SiteFooter";
import { GlobalEasterEggs } from "@/components/site/GlobalEasterEggs";
import { SITE_META } from "@/content/site";

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
  title: "我俩的时光｜恋爱手帐",
  description: "记录我和宝子的恋爱时光 — 私人手帐站点",
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
      <head>
        <Script
          src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <GlobalEasterEggs />
      </body>
    </html>
  );
}
