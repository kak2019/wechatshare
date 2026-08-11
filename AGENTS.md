## Cursor Cloud specific instructions

This is a Next.js 16 (App Router) WeChat Share POC app. Single service, no database, no Docker.

### Commands

See `package.json` for all scripts. Key commands:

- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint 9 flat config)

### Notes

- The WeChat JS-SDK signature API (`/api/wechat/signature`) requires `WECHAT_APP_ID` and `WECHAT_APP_SECRET` environment variables. Without them, the share feature will show a signature error — this is expected in local development unless you have valid credentials.
- ESLint has 2 pre-existing issues in `src/app/share/ShareClient.tsx` (a `react-hooks/set-state-in-effect` error and a `react-hooks/exhaustive-deps` warning). These are known and do not block development.
- No `.env.local` is committed; create one if you need to test with real WeChat credentials.
