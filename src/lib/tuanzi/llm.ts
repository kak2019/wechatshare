import {
  assertProviderConfigured,
  getProviderApiKey,
  getProviderBaseUrl,
} from "@/lib/tuanzi/providers";
import type { ProviderId, TuanziRole } from "@/lib/tuanzi/types";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type CompleteOptions = {
  role: TuanziRole;
  messages: ChatMessage[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
};

function buildUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  return `${trimmed}/chat/completions`;
}

function buildHeaders(provider: ProviderId, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (provider === "xiaomi") {
    headers["api-key"] = apiKey;
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

function buildBody(role: TuanziRole, messages: ChatMessage[], stream: boolean, maxTokens: number, temperature: number) {
  const body: Record<string, unknown> = {
    model: role.model,
    messages,
    stream,
    max_tokens: maxTokens,
    temperature,
  };

  if (role.capabilities.includes("web_search")) {
    body.tools = [
      {
        type: "web_search",
        max_keyword: 5,
        force_search: true,
        limit: 8,
      },
    ];
    body.tool_choice = "auto";
    body.extra_body = { thinking: { type: "disabled" } };
  }

  return body;
}

export async function completeText(options: CompleteOptions): Promise<string> {
  const { role, messages, maxTokens = 2048, temperature = 0.7 } = options;
  assertProviderConfigured(role.provider);
  const apiKey = getProviderApiKey(role.provider)!;
  const url = buildUrl(getProviderBaseUrl(role.provider));
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(role.provider, apiKey),
    body: JSON.stringify(buildBody(role, messages, false, maxTokens, temperature)),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${role.modelLabel} 请求失败 (${res.status}): ${errText.slice(0, 400)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function* streamCompletion(options: CompleteOptions): AsyncGenerator<string> {
  const { role, messages, maxTokens = 2048, temperature = 0.7 } = options;
  assertProviderConfigured(role.provider);
  const apiKey = getProviderApiKey(role.provider)!;
  const url = buildUrl(getProviderBaseUrl(role.provider));
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(role.provider, apiKey),
    body: JSON.stringify(buildBody(role, messages, true, maxTokens, temperature)),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${role.modelLabel} 流式请求失败 (${res.status}): ${errText.slice(0, 400)}`);
  }

  if (!res.body) {
    const text = await completeText({ ...options, stream: false });
    if (text) yield text;
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* ignore partial json */
      }
    }
  }
}

export function messagesWithSystem(role: TuanziRole, userContent: string): ChatMessage[] {
  return [
    { role: "system", content: role.systemPrompt },
    { role: "user", content: userContent },
  ];
}
