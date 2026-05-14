import Link from "next/link";

const ICP = "津ICP备2021004849号-2";
const MIIT = "https://beian.miit.gov.cn/";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/[0.06] bg-[#f5f5f7]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-sm font-medium text-[#1d1d1f]">记录与你有关的温柔日常</p>
          <p className="text-xs text-[#6e6e73]">© {new Date().getFullYear()} 我们的小宇宙</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#424245] sm:justify-end">
          <Link
            href="/share"
            className="transition-colors hover:text-[#1d1d1f]"
          >
            分享页
          </Link>
          <a
            href={MIIT}
            target="_blank"
            rel="nofollow noreferrer"
            className="transition-colors hover:text-[#1d1d1f]"
          >
            {ICP}
          </a>
        </nav>
      </div>
    </footer>
  );
}
