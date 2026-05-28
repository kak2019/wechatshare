"use client";

import type { ChatMessage } from "@/lib/ai-chat/types";

type ChatMessagesProps = {
  messages: ChatMessage[];
  streaming: boolean;
};

export function ChatMessages({ messages, streaming }: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-800/70">
          AI Chat
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          开始一段新对话
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--mute)]">
          支持流式输出与联网搜索。请先在设置中配置 API Key 与模型提供商，然后输入问题即可。
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-[var(--mute)]">
          <li>· 小米 MIMO 可配置 web_search 联网参数</li>
          <li>· 会话记录保存在本机浏览器</li>
          <li>· Enter 发送，Shift+Enter 换行</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={[
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]",
              msg.role === "user"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "border border-black/[0.06] bg-[var(--paper)] text-[var(--foreground)]",
            ].join(" ")}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
              {msg.role === "user" ? "你" : "AI"}
            </p>
            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
          </div>
        </div>
      ))}
      {streaming && (
        <div className="flex justify-start">
          <div className="rounded-2xl border border-black/[0.06] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--mute)]">
            正在生成…
          </div>
        </div>
      )}
    </div>
  );
}
