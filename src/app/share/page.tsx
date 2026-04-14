import type { Metadata } from "next";
import ShareClient from "./ShareClient";

const SHARE_TITLE = "微信分享 POC 演示";
const SHARE_DESC = "这是一个 Next.js 微信分享功能的概念验证页面，点击查看详情";

/**
 * 微信抓链接卡片需要 HTML 里是**绝对 HTTPS** 的 og:image。
 * 用无 NEXT_PUBLIC_ 前缀的 SITE_URL，在服务端按请求读取，避免「构建时没带上公网域名」导致仍是 localhost。
 */
function siteOrigin(): URL {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (raw) {
    return new URL(raw);
  }
  return new URL("http://localhost:3000");
}

/** 动态 metadata：线上改 .env 后只需重启进程，不必为 OG 单独 rebuild */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = siteOrigin();
  return {
    metadataBase,
    title: SHARE_TITLE,
    description: SHARE_DESC,
    openGraph: {
      title: SHARE_TITLE,
      description: SHARE_DESC,
      url: new URL("/share", metadataBase),
      images: [
        {
          url: "/share-icon.png",
          width: 300,
          height: 300,
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
      images: ["/share-icon.png"],
    },
  };
}

export default function SharePage() {
  return <ShareClient />;
}
