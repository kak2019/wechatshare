"use client";

import { motion } from "framer-motion";

import { LineDogOutline } from "./MascotSilhouettes";

const moments = [
  {
    date: "第一章",
    title: "相遇像慢镜头",
    body: "人潮里有你的侧脸，世界忽然安静半秒，然后又热烈起来。",
  },
  {
    date: "第二章",
    title: "把日常过成节日",
    body: "一杯奶茶、一场晚风、一个互相懂得的笑话，就是最好的纪念。",
  },
  {
    date: "第三章",
    title: "写给未来的信",
    body: "以后的路那么长，我们一页一页慢慢写，不着急，也不缺席。",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      delay: 0.08 * i,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function LoveScrollSections() {
  return (
    <div className="relative bg-[#fafafa]">
      <section
        id="story"
        className="mx-auto max-w-5xl px-6 py-28 sm:py-36"
      >
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-[#6e6e73]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          A story for us
        </motion.p>
        <motion.h2
          className="mt-6 text-center text-4xl font-semibold tracking-tight text-[#1d1d1f] sm:text-6xl sm:leading-[1.05]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: 32 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 1, delay: 0.06, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          每一页，
          <span className="bg-gradient-to-r from-amber-500/90 via-orange-500/85 to-rose-500/80 bg-clip-text text-transparent">
            都是日常里的光
          </span>
        </motion.h2>
        <motion.p
          className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-[#6e6e73] sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          这是属于我和宝子的恋爱手帐：用更慢的节奏、更柔的对比度，把平凡的日子装帧成一本可以反复翻阅的私人出版物。
        </motion.p>
      </section>

      <section
        id="moments"
        className="mx-auto max-w-6xl px-6 pb-28 sm:pb-36"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {moments.map((m, i) => (
            <motion.article
              key={m.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-[0_2px_40px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,0,0,0.1)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-100/0 via-transparent to-orange-100/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#ae8a3d]">
                {m.date}
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#1d1d1f]">
                {m.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6e6e73]">
                {m.body}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 pb-32 text-center">
        <motion.div
          className="rounded-[32px] bg-[#1d1d1f] px-8 py-16 text-white shadow-[0_40px_100px_rgba(0,0,0,0.22)] sm:px-16 sm:py-20"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
            今天也想对你说
          </p>
          <p className="mt-8 text-2xl font-medium leading-snug tracking-tight text-white/95 sm:text-3xl">
            “谢谢你愿意和我共享这辈子最普通的天气。”
          </p>
          <p className="mt-8 text-sm text-white/45">
            —— 页面里的「一二 / 布布」氛围来自温暖配色与原创插画轮廓；若你有正版素材，也可自行替换为图片。
          </p>
        </motion.div>

        <div className="relative mt-16 min-h-[120px]">
          <LineDogOutline />
        </div>
      </section>
    </div>
  );
}
