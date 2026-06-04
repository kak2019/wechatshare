This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 团子圆桌（/tuanzi）

多智能体圆桌：角色在 `content/tuanzi/roles/*.md` 用 Markdown 定义，引擎在 `src/lib/tuanzi/` 加载并调度，前端只渲染 SSE 气泡与纪要。

### 环境变量

复制 `.env.example` 为 `.env.local` 并填入：

- `MIMO_API_KEY` — 小米 MiMo 联网搜索（`mimo-v2.5-pro`）
- `SILICONFLOW_API_KEY` — 硅基流动（`Pro/zai-org/GLM-5.1`）
- `DEEPSEEK_API_KEY` — DeepSeek V4 Pro（`deepseek-v4-pro`）

新增角色：在 `content/tuanzi/roles/` 添加 `.md` 即可，详见 `content/tuanzi/README.md`。
