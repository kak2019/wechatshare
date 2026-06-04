import { randomUUID } from "crypto";

import { completeText, messagesWithSystem, streamCompletion } from "@/lib/tuanzi/llm";
import { createMeeting, getMeeting, updateMeeting } from "@/lib/tuanzi/meeting-store";
import {
  getHostRole,
  getWebSearchRole,
  resolveParticipants,
} from "@/lib/tuanzi/role-loader";
import { isProviderConfigured } from "@/lib/tuanzi/providers";
import type { Meeting, SseEvent, TuanziRole, Utterance } from "@/lib/tuanzi/types";

export type StartMeetingInput = {
  topic: string;
  participantIds: string[];
  maxRounds?: number;
};

function uid(): string {
  return randomUUID();
}

function summarizeUtterances(utterances: Utterance[], max = 6): string {
  return utterances
    .slice(-max)
    .map((u) => `【${u.roleName}·${u.modelLabel}】${u.content.slice(0, 280)}`)
    .join("\n\n");
}

async function* emitStream(
  role: TuanziRole,
  userContent: string,
  meta: { phase: string; round: number },
): AsyncGenerator<{ event: SseEvent; utterance?: Utterance }> {
  const utteranceId = uid();
  yield {
    event: {
      type: "turn_start",
      utteranceId,
      roleId: role.id,
      roleName: role.name,
      modelLabel: role.modelLabel,
      round: meta.round,
      phase: meta.phase,
    },
  };

  let content = "";
  try {
    for await (const delta of streamCompletion({
      role,
      messages: messagesWithSystem(role, userContent),
      stream: true,
    })) {
      content += delta;
      yield { event: { type: "turn_delta", utteranceId, delta } };
    }
  } catch {
    content = await completeText({
      role,
      messages: messagesWithSystem(role, userContent),
    });
    if (content) {
      yield { event: { type: "turn_delta", utteranceId, delta: content } };
    }
  }

  const utterance: Utterance = {
    id: utteranceId,
    roleId: role.id,
    roleName: role.name,
    modelLabel: role.modelLabel,
    provider: role.provider,
    phase: meta.phase,
    round: meta.round,
    content,
    timestamp: Date.now(),
  };

  yield {
    event: { type: "turn_end", utteranceId, content },
    utterance,
  };
}

export function createMeetingRecord(input: StartMeetingInput): Meeting {
  const topic = input.topic.trim();
  if (!topic) throw new Error("请输入议题");
  const maxRounds = Math.min(3, Math.max(1, input.maxRounds ?? 2));
  const participants = resolveParticipants(input.participantIds);
  const scout = getWebSearchRole();
  if (scout && !isProviderConfigured(scout.provider)) {
    throw new Error("联网检索需要配置 MIMO_API_KEY");
  }

  const meeting: Meeting = {
    id: uid(),
    topic,
    participantIds: participants.map((p) => p.id),
    maxRounds,
    phase: "pending",
    evidencePack: "",
    minutes: "",
    utterances: [],
    createdAt: Date.now(),
  };
  createMeeting(meeting);
  return meeting;
}

export async function* runMeeting(meetingId: string): AsyncGenerator<SseEvent> {
  const meeting = getMeeting(meetingId);
  if (!meeting) {
    yield { type: "error", message: "会议不存在或已过期" };
    return;
  }

  const host = getHostRole();
  const scout = getWebSearchRole();
  const participants = resolveParticipants(meeting.participantIds);
  const topic = meeting.topic;

  try {
    if (scout && isProviderConfigured(scout.provider)) {
      updateMeeting(meetingId, { phase: "evidence" });
      yield {
        type: "evidence_start",
        roleId: scout.id,
        roleName: scout.name,
        modelLabel: scout.modelLabel,
      };

      let evidence = "";
      const evidencePrompt = `请围绕以下议题进行联网检索，并输出结构化资料包（Evidence Pack）：\n\n议题：${topic}`;
      try {
        for await (const delta of streamCompletion({
          role: scout,
          messages: messagesWithSystem(scout, evidencePrompt),
          stream: true,
          maxTokens: 2048,
        })) {
          evidence += delta;
          yield { type: "evidence_delta", delta };
        }
      } catch {
        evidence = await completeText({
          role: scout,
          messages: messagesWithSystem(scout, evidencePrompt),
          maxTokens: 2048,
        });
        if (evidence) yield { type: "evidence_delta", delta: evidence };
      }

      updateMeeting(meetingId, { evidencePack: evidence });
      yield { type: "evidence_done", content: evidence };

      const scoutUtterance: Utterance = {
        id: uid(),
        roleId: scout.id,
        roleName: scout.name,
        modelLabel: scout.modelLabel,
        provider: scout.provider,
        phase: "evidence",
        round: 0,
        content: evidence,
        timestamp: Date.now(),
      };
      const m0 = getMeeting(meetingId)!;
      updateMeeting(meetingId, { utterances: [...m0.utterances, scoutUtterance] });
    }

    const evidencePack = getMeeting(meetingId)?.evidencePack ?? "";
    const evidenceBlock = evidencePack
      ? `\n\n## 联网资料包\n${evidencePack}`
      : "\n\n（本次无联网资料包）";

    updateMeeting(meetingId, { phase: "host_open" });
    yield {
      type: "host_open",
      roleId: host.id,
      roleName: host.name,
      modelLabel: host.modelLabel,
    };

    const openPrompt = `议题：${topic}\n与会分析席：${participants.map((p) => p.name).join("、")}${evidenceBlock}\n\n请作为主持人做简短开场（不超过 120 字）。`;
    for await (const chunk of emitStream(host, openPrompt, { phase: "host_open", round: 0 })) {
      yield chunk.event;
      if (chunk.utterance) {
        const m = getMeeting(meetingId)!;
        updateMeeting(meetingId, { utterances: [...m.utterances, chunk.utterance] });
      }
    }

    for (let round = 1; round <= meeting.maxRounds; round++) {
      const phase = round === 1 ? "round1" : "round2";
      updateMeeting(meetingId, { phase: phase as Meeting["phase"] });
      const history = getMeeting(meetingId)!.utterances;
      const historyText = summarizeUtterances(history);

      for (const role of participants) {
        const roundPrompt =
          round === 1
            ? `议题：${topic}${evidenceBlock}\n\n请给出你的独立观点（第 ${round} 轮）。`
            : `议题：${topic}${evidenceBlock}\n\n此前讨论摘要：\n${historyText}\n\n请在第 ${round} 轮补充、互评或回应其他席位（保持简洁）。`;

        for await (const chunk of emitStream(role, roundPrompt, { phase, round })) {
          yield chunk.event;
          if (chunk.utterance) {
            const m = getMeeting(meetingId)!;
            updateMeeting(meetingId, { utterances: [...m.utterances, chunk.utterance] });
          }
        }
      }
    }

    updateMeeting(meetingId, { phase: "minutes" });
    const allHistory = summarizeUtterances(getMeeting(meetingId)!.utterances, 12);
    const minutesPrompt = `议题：${topic}\n\n完整讨论记录：\n${allHistory}\n\n请输出 Markdown 会议纪要，包含：## 共识、## 分歧、## 建议行动`;

    let minutes = "";
    const minutesId = uid();
    yield {
      type: "turn_start",
      utteranceId: minutesId,
      roleId: host.id,
      roleName: host.name,
      modelLabel: host.modelLabel,
      round: meeting.maxRounds + 1,
      phase: "minutes",
    };

    try {
      for await (const delta of streamCompletion({
        role: host,
        messages: messagesWithSystem(host, minutesPrompt),
        stream: true,
        maxTokens: 3072,
      })) {
        minutes += delta;
        yield { type: "turn_delta", utteranceId: minutesId, delta };
      }
    } catch {
      minutes = await completeText({
        role: host,
        messages: messagesWithSystem(host, minutesPrompt),
        maxTokens: 3072,
      });
      if (minutes) yield { type: "turn_delta", utteranceId: minutesId, delta: minutes };
    }

    yield { type: "turn_end", utteranceId: minutesId, content: minutes };
    yield { type: "minutes", content: minutes };

    updateMeeting(meetingId, {
      phase: "done",
      minutes,
      utterances: [
        ...getMeeting(meetingId)!.utterances,
        {
          id: minutesId,
          roleId: host.id,
          roleName: host.name,
          modelLabel: host.modelLabel,
          provider: host.provider,
          phase: "minutes",
          round: meeting.maxRounds + 1,
          content: minutes,
          timestamp: Date.now(),
        },
      ],
    });
    yield { type: "done" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "会议执行失败";
    updateMeeting(meetingId, { phase: "error", error: message });
    yield { type: "error", message };
  }
}
