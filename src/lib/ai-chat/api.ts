import type {
  ChatCompletionRequest,
  ChatMessage,
  ChatSettings,
} from "@/lib/ai-chat/types";

export type StreamHandlers = {
  onDelta: (delta: string) => void;
  onDone: (fullContent: string) => void;
  onError: (message: string) => void;
};

function buildTools(settings: ChatSettings): Record<string, unknown>[] | undefined {
  if (!settings.webSearch.enabled) return undefined;
  return [
    {
      type: "web_search",
      max_keyword: settings.webSearch.maxKeyword,
      force_search: settings.webSearch.forceSearch,
      limit: settings.webSearch.limit,
      user_location: settings.webSearch.userLocation,
    },
  ];
}

export function buildCompletionRequest(
  settings: ChatSettings,
  messages: ChatMessage[],
): ChatCompletionRequest {
  return {
    baseUrl: settings.baseUrl.replace(/\/$/, ""),
    apiKey: settings.apiKey,
    authStyle: settings.authStyle,
    model: settings.model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: settings.stream,
    max_completion_tokens: settings.maxCompletionTokens,
    temperature: settings.temperature,
    top_p: settings.topP,
    thinking: settings.thinking,
    tools: buildTools(settings),
  };
}

function parseSseDelta(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return "";
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return "";
  try {
    const json = JSON.parse(payload) as {
      choices?: { delta?: { content?: string } }[];
    };
    return json.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}

export async function streamChatCompletion(
  settings: ChatSettings,
  messages: ChatMessage[],
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const body = buildCompletionRequest(settings, messages);

  let res: Response;
  try {
    res = await fetch("/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) return;
    handlers.onError(err instanceof Error ? err.message : "网络请求失败");
    return;
  }

  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      // ignore
    }
    handlers.onError(message);
    return;
  }

  if (!settings.stream) {
    try {
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };
      if (json.error?.message) {
        handlers.onError(json.error.message);
        return;
      }
      const content = json.choices?.[0]?.message?.content ?? "";
      if (content) handlers.onDelta(content);
      handlers.onDone(content);
    } catch (err) {
      handlers.onError(err instanceof Error ? err.message : "解析响应失败");
    }
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    handlers.onError("无法读取流式响应");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim() === "data: [DONE]") {
          handlers.onDone(full);
          return;
        }
        const delta = parseSseDelta(line);
        if (delta) {
          full += delta;
          handlers.onDelta(delta);
        }
      }
    }
    handlers.onDone(full);
  } catch (err) {
    if (signal?.aborted) return;
    handlers.onError(err instanceof Error ? err.message : "流式读取失败");
  } finally {
    reader.releaseLock();
  }
}
