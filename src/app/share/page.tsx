import type { Metadata } from "next";
import ShareClient from "./ShareClient";

const SHARE_TITLE = "微信分享 POC 演示";
const SHARE_DESC = "这是一个 Next.js 微信分享功能的概念验证页面，点击查看详情";
const SHARE_IMAGE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4dd.png";

export const metadata: Metadata = {
  title: SHARE_TITLE,
  description: SHARE_DESC,
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESC,
    images: [
      {
        url: SHARE_IMAGE,
        width: 72,
        height: 72,
        alt: SHARE_TITLE,
      },
    ],
    type: "website",
    locale: "zh_CN",
    siteName: "微信分享 POC",
  },
  twitter: {
    card: "summary",
    title: SHARE_TITLE,
    description: SHARE_DESC,
    images: [SHARE_IMAGE],
  },
  other: {
    "wx:title": SHARE_TITLE,
    "wx:description": SHARE_DESC,
    "wx:image": SHARE_IMAGE,
  },
};

export default function SharePage() {
  return <ShareClient />;
}
