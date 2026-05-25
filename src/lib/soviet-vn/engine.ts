import { GAL_NODES } from "@/content/soviet-vn/script";
import { applyStatDelta, mergeBestStats, resolveEndingId } from "@/lib/soviet-vn/scoring";
import type {
  BgmTrack,
  GalNode,
  GalStep,
  GameRuntime,
  SceneId,
  SovietSave,
  Stats,
} from "@/lib/soviet-vn/types";
import { DEFAULT_STATS } from "@/lib/soviet-vn/types";

/** 存档恢复或节点耗尽时，尝试还原 choice 等待态 */
export function repairRuntime(
  runtime: GameRuntime,
  nodes: Record<string, GalNode>,
): GameRuntime {
  if (runtime.awaitingChoice) return runtime;

  const node = nodes[runtime.nodeId];
  if (!node) return runtime;

  const prevStep: GalStep | undefined = node.steps[runtime.stepIndex - 1];
  if (prevStep?.type === "choice") {
    return {
      ...runtime,
      awaitingChoice: true,
      currentLine: prevStep.prompt
        ? { kind: "narrate", text: prevStep.prompt }
        : runtime.currentLine,
    };
  }

  return runtime;
}

export function createRuntimeFromSave(
  save: SovietSave,
  startNode: string,
): GameRuntime {
  if (save.inProgress) {
    const restored: GameRuntime = {
      nodeId: save.inProgress.nodeId,
      stepIndex: save.inProgress.stepIndex,
      stats: save.inProgress.stats,
      flags: save.inProgress.flags,
      choiceLog: save.inProgress.choiceLog,
      scene: save.inProgress.scene,
      bgm: save.inProgress.bgm,
      phase: "playing",
      pendingEndingId: null,
      awaitingChoice: save.inProgress.awaitingChoice ?? false,
      currentLine: save.inProgress.currentLine ?? null,
    };
    return repairRuntime(restored, GAL_NODES);
  }

  return {
    nodeId: startNode,
    stepIndex: 0,
    stats: { ...DEFAULT_STATS },
    flags: {},
    choiceLog: [],
    scene: "kremlin",
    bgm: "ambient",
    phase: "title",
    pendingEndingId: null,
    awaitingChoice: false,
    currentLine: null,
  };
}

export function runtimeToProgress(runtime: GameRuntime): SovietSave["inProgress"] {
  if (runtime.phase === "title" || runtime.phase === "ending") return null;
  return {
    nodeId: runtime.nodeId,
    stepIndex: runtime.stepIndex,
    stats: runtime.stats,
    flags: runtime.flags,
    choiceLog: runtime.choiceLog,
    scene: runtime.scene,
    bgm: runtime.bgm,
    awaitingChoice: runtime.awaitingChoice,
    currentLine: runtime.currentLine,
  };
}

export type StepResult = {
  runtime: GameRuntime;
  needsChoice: boolean;
  reachedEnding: boolean;
  endingId: string | null;
};

function withLine(
  runtime: GameRuntime,
  line: GameRuntime["currentLine"],
): GameRuntime {
  return { ...runtime, currentLine: line };
}

export function startGame(runtime: GameRuntime): GameRuntime {
  return {
    ...runtime,
    phase: "playing",
    nodeId: "prologue",
    stepIndex: 0,
    stats: { ...DEFAULT_STATS },
    flags: {},
    choiceLog: [],
    pendingEndingId: null,
    awaitingChoice: false,
    currentLine: null,
  };
}

export function advanceStep(
  runtime: GameRuntime,
  nodes: Record<string, GalNode>,
): StepResult {
  if (runtime.awaitingChoice || runtime.phase !== "playing") {
    return {
      runtime,
      needsChoice: runtime.awaitingChoice,
      reachedEnding: false,
      endingId: null,
    };
  }

  let state: GameRuntime = { ...runtime };

  while (true) {
    const node = nodes[state.nodeId];
    if (!node) {
      return {
        runtime: state,
        needsChoice: false,
        reachedEnding: true,
        endingId: "ending_a",
      };
    }

    if (state.stepIndex >= node.steps.length) {
      return {
        runtime: state,
        needsChoice: false,
        reachedEnding: false,
        endingId: null,
      };
    }

    const step = node.steps[state.stepIndex]!;
    state = { ...state, stepIndex: state.stepIndex + 1 };

    switch (step.type) {
      case "bg":
        state = { ...state, scene: step.scene as SceneId };
        continue;

      case "bgm":
        state = { ...state, bgm: step.track as BgmTrack };
        continue;

      case "effect":
        state = { ...state, stats: applyStatDelta(state.stats, step.delta) };
        continue;

      case "narrate":
        return {
          runtime: withLine(state, { kind: "narrate", text: step.text }),
          needsChoice: false,
          reachedEnding: false,
          endingId: null,
        };

      case "say":
        return {
          runtime: withLine(state, {
            kind: "say",
            speaker: step.speaker,
            text: step.text,
          }),
          needsChoice: false,
          reachedEnding: false,
          endingId: null,
        };

      case "choice":
        return {
          runtime: {
            ...state,
            awaitingChoice: true,
            currentLine: step.prompt
              ? { kind: "narrate", text: step.prompt }
              : state.currentLine,
          },
          needsChoice: true,
          reachedEnding: false,
          endingId: null,
        };

      case "resolve_ending": {
        const endingId = resolveEndingId(state.stats);
        state = {
          ...state,
          pendingEndingId: endingId,
          phase: "ending",
        };
        return {
          runtime: state,
          needsChoice: false,
          reachedEnding: true,
          endingId,
        };
      }

      case "ending":
        state = {
          ...state,
          pendingEndingId: step.id,
          phase: "ending",
        };
        return {
          runtime: state,
          needsChoice: false,
          reachedEnding: true,
          endingId: step.id,
        };

      case "jump":
        state = { ...state, nodeId: step.node, stepIndex: 0 };
        continue;

      default:
        continue;
    }
  }
}

export function pickChoice(
  runtime: GameRuntime,
  nodes: Record<string, GalNode>,
  optionIndex: number,
): GameRuntime {
  if (!runtime.awaitingChoice) return runtime;

  const node = nodes[runtime.nodeId];
  const step = node?.steps[runtime.stepIndex - 1];
  if (!step || step.type !== "choice") return runtime;

  const option = step.options[optionIndex];
  if (!option) return runtime;

  let next: GameRuntime = {
    ...runtime,
    awaitingChoice: false,
    currentLine: null,
    choiceLog: [...runtime.choiceLog, option.label],
    stats: option.effects
      ? applyStatDelta(runtime.stats, option.effects)
      : runtime.stats,
    nodeId: option.next,
    stepIndex: 0,
  };

  if (option.flag) {
    next = {
      ...next,
      flags: { ...next.flags, [option.flag]: true },
    };
  }

  return next;
}

export function recordEnding(
  save: SovietSave,
  endingId: string,
  stats: Stats,
  choices: string[],
): SovietSave {
  const unlocked = save.unlockedEndings.includes(endingId)
    ? save.unlockedEndings
    : [...save.unlockedEndings, endingId];

  return {
    ...save,
    unlockedEndings: unlocked,
    bestStats: mergeBestStats(save.bestStats, stats),
    runHistory: [...save.runHistory, { endingId, stats, choices }],
    inProgress: null,
  };
}
