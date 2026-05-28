import type { ChatSettings, ProviderId } from "@/lib/ai-chat/types";

export type ProviderPreset = {
  id: ProviderId;
  label: string;
  description: string;
  settings: Partial<ChatSettings>;
  webSearchNote?: string;
};

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "xiaomi-mimo",
    label: "小米 MIMO",
    description: "支持 web_search 联网搜索工具",
    settings: {
      baseUrl: "https://api.xiaomimimo.com/v1",
      authStyle: "api-key",
      model: "mimo-v2.5-pro",
      stream: true,
      maxCompletionTokens: 1024,
      temperature: 1.0,
      topP: 0.95,
      thinking: { type: "disabled" },
      webSearch: {
        enabled: true,
        forceSearch: true,
        maxKeyword: 3,
        limit: 1,
        userLocation: {
          type: "approximate",
          country: "China",
          region: "Hubei",
          city: "Wuhan",
        },
      },
    },
  },
  {
    id: "openai-compatible",
    label: "OpenAI 兼容",
    description: "通用 OpenAI Chat Completions 接口",
    settings: {
      baseUrl: "https://api.openai.com/v1",
      authStyle: "bearer",
      model: "gpt-4o-mini",
      stream: true,
      maxCompletionTokens: 1024,
      temperature: 1.0,
      topP: 0.95,
      thinking: { type: "disabled" },
      webSearch: {
        enabled: false,
        forceSearch: false,
        maxKeyword: 3,
        limit: 1,
        userLocation: {
          type: "approximate",
          country: "China",
          region: "",
          city: "",
        },
      },
    },
    webSearchNote: "联网搜索参数为小米 MIMO 扩展，其他厂商可能不支持或会报错。",
  },
  {
    id: "custom",
    label: "自定义",
    description: "自行填写 Base URL、鉴权方式与模型",
    settings: {},
  },
];

export function getProviderPreset(id: ProviderId): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id);
}
