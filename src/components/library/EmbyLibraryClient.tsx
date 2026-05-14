"use client";

import { motion } from "framer-motion";

import { SiteTopNav } from "@/components/site/SiteTopNav";

type EmbyLibraryClientProps = {
  embyUrl: string;
};

const easeApple = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function EmbyLibraryClient({ embyUrl }: EmbyLibraryClientProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1d1d1f]">
      <SiteTopNav />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeApple }}
        >
          <p className="text-center text-xs font-medium uppercase tracking-[0.35em] text-[#6e6e73]">
            Emby · Private Theater
          </p>
          <h1 className="mt-5 text-center text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]">
            只属于我俩的
            <span className="block bg-gradient-to-r from-amber-500/90 via-orange-500/85 to-rose-500/80 bg-clip-text text-transparent">
              放映厅
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-[#6e6e73] sm:text-lg">
            把 Emby 影视库嵌在这个小站里：像手帐里夹一张电影票根——点开就能继续上次没看完的那集。
          </p>
        </motion.div>

        <motion.div
          className="relative mt-12 overflow-hidden rounded-[28px] bg-[#1d1d1f] shadow-[0_40px_100px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
          initial={{ opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.12, ease: easeApple }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <iframe
            title="Emby 私人影视库"
            src={embyUrl}
            className="block h-[min(76dvh,840px)] w-full border-0 sm:h-[min(80dvh,920px)]"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-read; clipboard-write"
            referrerPolicy="no-referrer-when-downgrade"
            loading="lazy"
          />
        </motion.div>

        <motion.section
          className="mt-10 rounded-3xl bg-white p-7 shadow-[0_2px_40px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] sm:p-9"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: easeApple }}
        >
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            如果中间是一片空白？
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6e6e73]">
            很多 Emby 默认会禁止在「别的域名」的{" "}
            <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.8rem] text-[#1d1d1f]">
              iframe
            </code>{" "}
            里打开，浏览器会拦下嵌入（你仍可在新标签页正常观看）。若你能登录服务器，可在 Emby
            后台 / 反向代理里调整响应头，或继续用下面的按钮直接打开库页面。
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-[#6e6e73]">
            <li>
              本站是 <strong className="font-medium text-[#1d1d1f]">HTTPS</strong> 时，嵌入{" "}
              <strong className="font-medium text-[#1d1d1f]">HTTP</strong>{" "}
              的 Emby 会被浏览器拦截（混合内容）；需要给 Emby 也配置上 HTTPS / 反代。
            </li>
            <li>
              域名、端口变更时，设置环境变量{" "}
              <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.8rem]">
                NEXT_PUBLIC_EMBY_URL
              </code>{" "}
              为完整地址（含协议）。
            </li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={embyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#1d1d1f] px-7 py-3 text-sm font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              新窗口打开 Emby
            </a>
            <p className="text-xs text-[#86868b]">
              当前嵌入地址：<span className="break-all">{embyUrl}</span>
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
