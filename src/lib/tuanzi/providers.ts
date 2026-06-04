import type { ProviderConfig, ProviderId } from "@/lib/tuanzi/types";

const PROVIDER_META: Record<ProviderId, { label: string; envKey: string; baseUrlEnv: string; defaultBaseUrl: string }> = {
  xiaomi: {
    label: "小米 MiMo",
    envKey: "MIMO_API_KEY",
    baseUrlEnv: "MIMO_BASE_URL",
    defaultBaseUrl: "https://api.xiaomimimo.com/v1",
  },
  siliconflow: {
    label: "硅基流动",
    envKey: "SILICONFLOW_API_KEY",
    baseUrlEnv: "SILICONFLOW_BASE_URL",
    defaultBaseUrl: "https://api.siliconflow.cn/v1",
  },
  deepseek: {
    label: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    baseUrlEnv: "DEEPSEEK_BASE_URL",
    defaultBaseUrl: "https://api.deepseek.com",
  },
};

export function getProviderApiKey(provider: ProviderId): string | null {
  const key = PROVIDER_META[provider].envKey;
  const value = process.env[key]?.trim();
  return value || null;
}

export function getProviderBaseUrl(provider: ProviderId): string {
  const meta = PROVIDER_META[provider];
  return process.env[meta.baseUrlEnv]?.trim() || meta.defaultBaseUrl;
}

export function isProviderConfigured(provider: ProviderId): boolean {
  return !!getProviderApiKey(provider);
}

export function listProviderConfigs(): ProviderConfig[] {
  return (Object.keys(PROVIDER_META) as ProviderId[]).map((id) => ({
    id,
    label: PROVIDER_META[id].label,
    configured: isProviderConfigured(id),
  }));
}

export function assertProviderConfigured(provider: ProviderId): void {
  if (!isProviderConfigured(provider)) {
    throw new Error(`未配置 ${PROVIDER_META[provider].label} API Key（${PROVIDER_META[provider].envKey}）`);
  }
}
