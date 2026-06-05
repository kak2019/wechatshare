export type ProviderId = "xiaomi" | "siliconflow" | "deepseek";

export type RoleCapability = "web_search";

export type TuanziRole = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  accent: string;
  host: boolean;
  provider: ProviderId;
  model: string;
  modelLabel: string;
  capabilities: RoleCapability[];
  selectable: boolean;
  systemPrompt: string;
};

export type MeetingPhase =
  | "pending"
  | "evidence"
  | "host_open"
  | "round1"
  | "round2"
  | "finale"
  | "done"
  | "error";

export type Utterance = {
  id: string;
  roleId: string;
  roleName: string;
  modelLabel: string;
  provider: ProviderId;
  phase: string;
  round: number;
  content: string;
  timestamp: number;
};

export type Meeting = {
  id: string;
  topic: string;
  participantIds: string[];
  maxRounds: number;
  phase: MeetingPhase;
  evidencePack: string;
  utterances: Utterance[];
  error?: string;
  createdAt: number;
};

export type SseEvent =
  | { type: "evidence_start"; roleId: string; roleName: string; modelLabel: string }
  | { type: "evidence_delta"; delta: string }
  | { type: "evidence_done"; content: string }
  | { type: "host_open"; roleId: string; roleName: string; modelLabel: string }
  | { type: "turn_start"; utteranceId: string; roleId: string; roleName: string; modelLabel: string; round: number; phase: string }
  | { type: "turn_delta"; utteranceId: string; delta: string }
  | { type: "turn_end"; utteranceId: string; content: string }
  | { type: "error"; message: string }
  | { type: "done" };

export type ProviderConfig = {
  id: ProviderId;
  label: string;
  configured: boolean;
};
