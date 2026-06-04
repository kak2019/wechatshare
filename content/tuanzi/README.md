# 团子圆桌 — 角色配置

新增参会角色：**在本目录新建一个 `.md` 文件即可**，无需改 TypeScript。

## Frontmatter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识 |
| `name` | 是 | 显示名 |
| `title` | 否 | 席位副标题 |
| `avatar` | 否 | 图片路径，如 `/tuanzi/avatars/xxx.svg` |
| `accent` | 否 | 主题色 hex |
| `host` | 否 | `true` 表示主持人（仅团子） |
| `provider` | 是* | `xiaomi` / `siliconflow` / `deepseek` |
| `model` | 是* | 对应平台的模型 ID |
| `modelLabel` | 推荐 | 气泡上显示的模型名 |
| `capabilities` | 否 | `web_search` 表示 Phase0 联网检索 |
| `selectable` | 否 | `false` 时不在选席列表出现（如探子） |

正文 Markdown = 注入模型的 system prompt。

## 环境变量

见仓库根目录 `.env.example`。
