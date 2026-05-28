"use client";

import { useCallback, useRef } from "react";

type ChatInputProps = {
  disabled: boolean;
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function ChatInput({ disabled, streaming, onSend, onStop }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const text = el.value.trim();
    if (!text || disabled || streaming) return;
    onSend(text);
    el.value = "";
    el.style.height = "auto";
  }, [disabled, onSend, streaming]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  return (
    <div className="border-t border-black/[0.06] bg-[var(--background)]/80 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="输入消息…"
          disabled={disabled && !streaming}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] outline-none transition focus:border-amber-500/50 disabled:opacity-50"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="shrink-0 rounded-2xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            停止
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0 rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-85 disabled:opacity-40"
          >
            发送
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-[var(--mute)]">
        Enter 发送 · Shift+Enter 换行
      </p>
    </div>
  );
}
