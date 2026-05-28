import { NextResponse } from "next/server";

import type { ChatCompletionRequest } from "@/lib/ai-chat/types";

export const runtime = "nodejs";

function buildUpstreamUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  return `${trimmed}/chat/completions`;
}

function buildAuthHeaders(
  apiKey: string,
  authStyle: ChatCompletionRequest["authStyle"],
): HeadersInit {
  if (authStyle === "api-key") {
    return { "api-key": apiKey };
  }
  return { Authorization: `Bearer ${apiKey}` };
}

function validateRequest(body: Partial<ChatCompletionRequest>): string | null {
  if (!body.baseUrl?.trim()) return "缺少 baseUrl";
  if (!body.apiKey?.trim()) return "缺少 apiKey";
  if (!body.model?.trim()) return "缺少 model";
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return "messages 不能为空";
  }
  return null;
}

export async function POST(req: Request) {
  let body: Partial<ChatCompletionRequest>;
  try {
    body = (await req.json()) as Partial<ChatCompletionRequest>;
  } catch {
    return NextResponse.json({ error: "无效的 JSON 请求体" }, { status: 400 });
  }

  const validationError = validateRequest(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const {
    baseUrl,
    apiKey,
    authStyle = "bearer",
    model,
    messages,
    stream = true,
    max_completion_tokens,
    temperature,
    top_p,
    thinking,
    tools,
  } = body as ChatCompletionRequest;

  const upstreamBody: Record<string, unknown> = {
    model,
    messages,
    stream,
    stop: null,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  if (typeof max_completion_tokens === "number") {
    upstreamBody.max_completion_tokens = max_completion_tokens;
  }
  if (typeof temperature === "number") upstreamBody.temperature = temperature;
  if (typeof top_p === "number") upstreamBody.top_p = top_p;
  if (thinking) upstreamBody.thinking = thinking;
  if (tools && tools.length > 0) upstreamBody.tools = tools;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(buildUpstreamUrl(baseUrl), {
      method: "POST",
      headers: {
        ...buildAuthHeaders(apiKey, authStyle),
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
      },
      body: JSON.stringify(upstreamBody),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "上游请求失败",
        status: 502,
      },
      { status: 502 },
    );
  }

  if (!upstreamRes.ok) {
    let errorMessage = `上游错误 (${upstreamRes.status})`;
    try {
      const errJson = (await upstreamRes.json()) as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof errJson.error === "string") errorMessage = errJson.error;
      else if (errJson.error?.message) errorMessage = errJson.error.message;
      else if (errJson.message) errorMessage = errJson.message;
    } catch {
      try {
        errorMessage = await upstreamRes.text();
      } catch {
        // ignore
      }
    }
    return NextResponse.json(
      { error: errorMessage, status: upstreamRes.status },
      { status: upstreamRes.status },
    );
  }

  if (!stream) {
    const json = await upstreamRes.json();
    return NextResponse.json(json);
  }

  if (!upstreamRes.body) {
    return NextResponse.json({ error: "上游未返回流" }, { status: 502 });
  }

  return new Response(upstreamRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
