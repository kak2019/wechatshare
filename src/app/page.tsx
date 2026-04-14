import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          微信分享 POC
        </h1>
        <p className="text-gray-500 mb-8">
          Next.js + 微信 JS-SDK 概念验证项目
        </p>
        <Link
          href="/share"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors text-lg"
        >
          进入分享页面 →
        </Link>
      </div>
    </div>
  );
}
