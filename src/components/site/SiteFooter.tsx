import Link from "next/link";

import { FOOTER } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/[0.06] bg-[#f5f5f7]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-sm font-medium text-[#1d1d1f]">{FOOTER.tagline}</p>
          <p className="text-xs text-[#6e6e73]">
            © {new Date().getFullYear()} {FOOTER.copyright}
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#424245] sm:justify-end">
          {FOOTER.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#1d1d1f]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={FOOTER.icpUrl}
            target="_blank"
            rel="nofollow noreferrer"
            className="transition-colors hover:text-[#1d1d1f]"
          >
            {FOOTER.icp}
          </a>
        </nav>
      </div>
    </footer>
  );
}
