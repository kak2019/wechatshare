"use client";

import { useCallback, useRef, useState } from "react";

import { ChatInput } from "@/components/ai-chat/ChatInput";
import { ChatMessages } from "@/components/ai-chat/ChatMessages";
import { ChatSettingsPanel } from "@/components/ai-chat/ChatSettingsPanel";
import { ChatSidebar } from "@/components/ai-chat/ChatSidebar";
import { streamChatCompletion } from "@/lib/ai-chat/api";
import {
  createMessage,
  createSession,
  deleteAllSessions,
  deleteSession,
  loadStore,
  persistStore,
  sessionTitleFromMessage,
  upsertSession,
} from "@/lib/ai-chat/storage";
import type { ChatSession, ChatSettings, ChatStore } from "@/lib/ai-chat/types";

export function ChatClient() {
  const [store, setStore] = useState<ChatStore>(() => loadStore());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const persist = useCallback((next: ChatStore) => {
    setStore(next);
    persistStore(next);
  }, []);

  const activeSession =
    store.sessions.find((s) => s.id === store.activeSessionId) ?? null;

  const updateSettings = useCallback(
    (settings: ChatSettings) => {
      persist({ ...store, settings });
    },
    [persist, store],
  );

  const handleNewSession = useCallback(() => {
    const session = createSession();
    persist({
      ...store,
      sessions: [session, ...store.sessions],
      activeSessionId: session.id,
    });
    setError(null);
  }, [persist, store]);

  const handleSelectSession = useCallback(
    (id: string) => {
      persist({ ...store, activeSessionId: id });
      setError(null);
    },
    [persist, store],
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      persist(deleteSession(store, id));
    },
    [persist, store],
  );

  const handleDeleteAll = useCallback(() => {
    persist(deleteAllSessions(store));
  }, [persist, store]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!store.settings.apiKey.trim()) {
        setError("请先在设置中配置 API Key");
        setSettingsOpen(true);
        return;
      }

      let session = activeSession;
      let nextStore = store;

      if (!session) {
        session = createSession(text);
        nextStore = {
          ...store,
          sessions: [session, ...store.sessions],
          activeSessionId: session.id,
        };
      }

      const userMessage = createMessage("user", text);
      const assistantMessage = createMessage("assistant", "");
      const messages = [...session.messages, userMessage, assistantMessage];
      const updatedSession: ChatSession = {
        ...session,
        title:
          session.messages.length === 0
            ? sessionTitleFromMessage(text)
            : session.title,
        messages,
        updatedAt: Date.now(),
      };

      nextStore = upsertSession(nextStore, updatedSession);
      persist(nextStore);
      setError(null);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      let assistantContent = "";

      await streamChatCompletion(
        nextStore.settings,
        messages.slice(0, -1),
        {
          onDelta: (delta) => {
            assistantContent += delta;
            setStore((prev) => {
              const current = prev.sessions.find((s) => s.id === updatedSession.id);
              if (!current) return prev;
              const nextMessages = current.messages.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, content: assistantContent }
                  : m,
              );
              const nextSession: ChatSession = {
                ...current,
                messages: nextMessages,
                updatedAt: Date.now(),
              };
              const sessions = prev.sessions.map((s) =>
                s.id === nextSession.id ? nextSession : s,
              );
              const next = { ...prev, sessions };
              persistStore(next);
              return next;
            });
          },
          onDone: (full) => {
            setStore((prev) => {
              const current = prev.sessions.find((s) => s.id === updatedSession.id);
              if (!current) return prev;
              const nextMessages = current.messages.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: full } : m,
              );
              const nextSession: ChatSession = {
                ...current,
                messages: nextMessages,
                updatedAt: Date.now(),
              };
              const sessions = prev.sessions.map((s) =>
                s.id === nextSession.id ? nextSession : s,
              );
              const next = { ...prev, sessions };
              persistStore(next);
              return next;
            });
            setStreaming(false);
            abortRef.current = null;
          },
          onError: (message) => {
            setError(message);
            setStreaming(false);
            abortRef.current = null;
          },
        },
        controller.signal,
      );
    },
    [activeSession, persist, store],
  );

  return (
    <div className="flex min-h-0 flex-1">
      <ChatSidebar
        open={sidebarOpen}
        sessions={store.sessions}
        activeSessionId={store.activeSessionId}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
        onDeleteAll={handleDeleteAll}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-black/[0.08] px-3 py-1.5 text-xs font-medium transition hover:bg-black/[0.04] md:hidden"
            >
              会话
            </button>
            <div>
              <h1 className="text-sm font-semibold">
                {activeSession?.title ?? "AI Chat"}
              </h1>
              <p className="text-[10px] text-[var(--mute)]">
                {store.settings.model}
                {store.settings.webSearch.enabled ? " · 联网已开启" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-lg border border-black/[0.08] px-3 py-1.5 text-xs font-medium transition hover:bg-black/[0.04]"
          >
            设置
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 sm:mx-6">
            {error}
          </div>
        )}

        <ChatMessages
          messages={activeSession?.messages ?? []}
          streaming={streaming}
        />

        <ChatInput
          disabled={!store.settings.apiKey.trim()}
          streaming={streaming}
          onSend={handleSend}
          onStop={handleStop}
        />
      </div>

      <ChatSettingsPanel
        open={settingsOpen}
        settings={store.settings}
        onClose={() => setSettingsOpen(false)}
        onChange={updateSettings}
      />
    </div>
  );
}
