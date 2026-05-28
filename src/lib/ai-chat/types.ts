export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type ProviderId = "xiaomi-mimo" | "openai-compatible" | "custom";

export type AuthStyle = "api-key" | "bearer";

export type WebSearchSettings = {
  enabled: boolean;
  forceSearch: boolean;
  maxKeyword: number;
  limit: number;
  userLocation: {
    type: "approximate";
    country: string;
    region: string;
    city: string;
  };
};

export type ChatSettings = {
  providerId: ProviderId;
  baseUrl: string;
  apiKey: string;
  authStyle: AuthStyle;
  model: string;
  stream: boolean;
  maxCompletionTokens: number;
  temperature: number;
  topP: number;
  webSearch: WebSearchSettings;
  thinking: { type: "disabled" | "enabled" };
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type ChatStore = {
  version: 1;
  settings: ChatSettings;
  sessions: ChatSession[];
  activeSessionId: string | null;
  lastSaved: number;
};

export type ChatCompletionRequest = {
  baseUrl: string;
  apiKey: string;
  authStyle: AuthStyle;
  model: string;
  messages: { role: ChatRole; content: string }[];
  stream: boolean;
  max_completion_tokens?: number;
  temperature?: number;
  top_p?: number;
  thinking?: { type: "disabled" | "enabled" };
  tools?: Record<string, unknown>[];
};
