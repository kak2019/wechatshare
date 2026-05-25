export type SceneId =
  | "kremlin"
  | "sochi"
  | "fishing_port"
  | "office"
  | "dream"
  | "dissolve";

export type BgmTrack = "ambient" | "sochi" | "fishing" | "katyusha" | "none";

export type StatKey =
  | "authority"
  | "reform"
  | "integrity"
  | "welfare"
  | "diplomacy"
  | "idealism";

export type Stats = Record<StatKey, number>;

export const STAT_LABELS: Record<StatKey, string> = {
  authority: "集权",
  reform: "改革",
  integrity: "廉正",
  welfare: "民生",
  diplomacy: "国际",
  idealism: "理想",
};

export const DEFAULT_STATS: Stats = {
  authority: 50,
  reform: 50,
  integrity: 50,
  welfare: 50,
  diplomacy: 50,
  idealism: 50,
};

export type ChoiceOption = {
  label: string;
  next: string;
  effects?: Partial<Stats>;
  flag?: string;
};

export type GalStep =
  | { type: "bg"; scene: SceneId }
  | { type: "bgm"; track: BgmTrack }
  | { type: "narrate"; text: string }
  | { type: "say"; speaker: string; text: string }
  | { type: "choice"; prompt?: string; options: ChoiceOption[] }
  | { type: "effect"; delta: Partial<Stats> }
  | { type: "resolve_ending" }
  | { type: "ending"; id: string }
  | { type: "jump"; node: string };

export type GalNode = {
  id: string;
  steps: GalStep[];
};

export type EndingDef = {
  id: string;
  title: string;
  subtitle: string;
  body: string[];
  tone: "failure" | "bittersweet" | "dream";
};

export type PersonalityDef = {
  id: string;
  name: string;
  epithet: string;
  description: string;
};

export type RuntimePhase =
  | "title"
  | "playing"
  | "ending"
  | "gallery"
  | "personality"
  | "dream";

export type GameRuntime = {
  nodeId: string;
  stepIndex: number;
  stats: Stats;
  flags: Record<string, boolean>;
  choiceLog: string[];
  scene: SceneId;
  bgm: BgmTrack;
  phase: RuntimePhase;
  pendingEndingId: string | null;
  awaitingChoice: boolean;
  currentLine: { kind: "narrate" | "say"; speaker?: string; text: string } | null;
};

export type SovietSave = {
  version: 1;
  unlockedEndings: string[];
  seenDream: boolean;
  bestStats: Stats;
  runHistory: { endingId: string; stats: Stats; choices: string[] }[];
  muted: boolean;
  inProgress: {
    nodeId: string;
    stepIndex: number;
    stats: Stats;
    flags: Record<string, boolean>;
    choiceLog: string[];
    scene: SceneId;
    bgm: BgmTrack;
  } | null;
  lastSaved: number;
};
