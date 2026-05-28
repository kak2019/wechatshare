import { getProviderPreset } from "@/lib/ai-chat/providers";
import type {
  ChatMessage,
  ChatSession,
  ChatSettings,
  ChatStore,
} from "@/lib/ai-chat/types";

const STORAGE_KEY = "ai-chat:v1";

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultSettings(): ChatSettings {
  const preset = getProviderPreset("xiaomi-mimo");
  return {
    providerId: "xiaomi-mimo",
    baseUrl: "https://api.xiaomimimo.com/v1",
    apiKey: "",
    authStyle: "api-key",
    model: "mimo-v2.5-pro",
    stream: true,
    maxCompletionTokens: 1024,
    temperature: 1.0,
    topP: 0.95,
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
    thinking: { type: "disabled" },
    ...preset?.settings,
  };
}

export function createEmptyStore(): ChatStore {
  return {
    version: 1,
    settings: createDefaultSettings(),
    sessions: [],
    activeSessionId: null,
    lastSaved: Date.now(),
  };
}

function migrateStore(raw: Partial<ChatStore>): ChatStore {
  const defaults = createEmptyStore();
  const settings = {
    ...defaults.settings,
    ...(raw.settings ?? {}),
    webSearch: {
      ...defaults.settings.webSearch,
      ...(raw.settings?.webSearch ?? {}),
      userLocation: {
        ...defaults.settings.webSearch.userLocation,
        ...(raw.settings?.webSearch?.userLocation ?? {}),
      },
    },
    thinking: {
      ...defaults.settings.thinking,
      ...(raw.settings?.thinking ?? {}),
    },
  };

  return {
    version: 1,
    settings,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    activeSessionId:
      typeof raw.activeSessionId === "string" ? raw.activeSessionId : null,
    lastSaved: typeof raw.lastSaved === "number" ? raw.lastSaved : Date.now(),
  };
}

export function loadStore(): ChatStore {
  if (typeof window === "undefined") return createEmptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStore();
    return migrateStore(JSON.parse(raw) as Partial<ChatStore>);
  } catch {
    return createEmptyStore();
  }
}

export function persistStore(store: ChatStore): void {
  if (typeof window === "undefined") return;
  const next = { ...store, lastSaved: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function sessionTitleFromMessage(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (!trimmed) return "新对话";
  return trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed;
}

export function createSession(firstMessage?: string): ChatSession {
  const now = Date.now();
  return {
    id: createId(),
    title: firstMessage ? sessionTitleFromMessage(firstMessage) : "新对话",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: createId(),
    role,
    content,
    createdAt: Date.now(),
  };
}

export function deleteSession(store: ChatStore, sessionId: string): ChatStore {
  const sessions = store.sessions.filter((s) => s.id !== sessionId);
  const activeSessionId =
    store.activeSessionId === sessionId
      ? (sessions[0]?.id ?? null)
      : store.activeSessionId;
  return { ...store, sessions, activeSessionId };
}

export function deleteAllSessions(store: ChatStore): ChatStore {
  return { ...store, sessions: [], activeSessionId: null };
}

export function upsertSession(
  store: ChatStore,
  session: ChatSession,
): ChatStore {
  const exists = store.sessions.some((s) => s.id === session.id);
  const sessions = exists
    ? store.sessions.map((s) => (s.id === session.id ? session : s))
    : [session, ...store.sessions];
  return {
    ...store,
    sessions,
    activeSessionId: session.id,
  };
}

export function applyProviderPreset(
  settings: ChatSettings,
  providerId: ChatSettings["providerId"],
): ChatSettings {
  const preset = getProviderPreset(providerId);
  if (!preset) return { ...settings, providerId };
  return {
    ...settings,
    providerId,
    ...preset.settings,
    apiKey: settings.apiKey,
    webSearch: {
      ...settings.webSearch,
      ...(preset.settings.webSearch ?? {}),
      userLocation: {
        ...settings.webSearch.userLocation,
        ...(preset.settings.webSearch?.userLocation ?? {}),
      },
    },
    thinking: preset.settings.thinking ?? settings.thinking,
  };
}
