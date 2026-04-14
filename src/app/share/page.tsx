import type { Metadata } from "next";
import ShareClient from "./ShareClient";

export const metadata: Metadata = {
  title: "微信分享 POC 演示",
  description: "这是一个 Next.js 微信分享功能的概念验证页面",
  openGraph: {
    title: "微信分享 POC 演示",
    description: "这是一个 Next.js 微信分享功能的概念验证页面",
    images: [
      {
        url: "https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico",
        width: 200,
        height: 200,
        alt: "微信分享图标",
      },
    ],
    type: "website",
    locale: "zh_CN",
  },
};

export default function SharePage() {
  return <ShareClient />;
}
