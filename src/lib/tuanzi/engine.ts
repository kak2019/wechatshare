import { randomUUID } from "crypto";

import { completeText, messagesWithSystem, streamCompletion } from "@/lib/tuanzi/llm";
import { createMeeting, getMeeting, updateMeeting } from "@/lib/tuanzi/meeting-store";
import { isProviderConfigured } from "@/lib/tuanzi/providers";
import {
  getHostRole,
  getRole,
  getWebSearchRole,
  resolveParticipants,
} from "@/lib/tuanzi/role-loader";
import type { Meeting, SseEvent, TuanziRole, Utterance } from "@/lib/tuanzi/types";

export type StartMeetingInput = {
  topic: string;
  participantIds: string[];
  maxRounds?: number;
};

const JOKER_ID = "duanzishou";

function uid(): string {
  return randomUUID();
}

function summarizeUtterances(utterances: Utterance[], max = 6): string {
  return utterances
    .slice(-max)
    .map((u) => `【${u.roleName}·${u.modelLabel}】${u.content.slice(0, 280)}`)
    .join("\n\n");
}

function splitParticipants(participants: TuanziRole[]) {
  const analysts = participants.filter((p) => p.id !== JOKER_ID);
  const joker = participants.find((p) => p.id === JOKER_ID);
  return { analysts, joker };
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
  const { analysts } = splitParticipants(participants);
  if (analysts.length < 1) {
    throw new Error("请至少选择一位分析席（段子手仅负责终场点评）");
  }
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
  const { analysts, joker } = splitParticipants(participants);
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

    const seatNames = [
      ...analysts.map((p) => p.name),
      ...(joker ? [`${joker.name}（终场点评）`] : []),
    ].join("、");

    updateMeeting(meetingId, { phase: "host_open" });
    yield {
      type: "host_open",
      roleId: host.id,
      roleName: host.name,
      modelLabel: host.modelLabel,
    };

    const openPrompt = `议题：${topic}\n与会席次：${seatNames}${evidenceBlock}\n\n请作为主持人做简短开场（不超过 120 字）。`;
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

      for (const role of analysts) {
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

    const finaleRole = joker ?? getRole(JOKER_ID);
    if (finaleRole && meeting.participantIds.includes(JOKER_ID)) {
      updateMeeting(meetingId, { phase: "finale" });
      const allHistory = summarizeUtterances(getMeeting(meetingId)!.utterances, 16);
      const finalePrompt = `议题：${topic}${evidenceBlock}\n\n全场讨论记录：\n${allHistory}\n\n请用段子手人设做终场点评：诙谐、好读，点出亮点和槽点，最后给一句收束。`;

      for await (const chunk of emitStream(finaleRole, finalePrompt, {
        phase: "finale",
        round: meeting.maxRounds + 1,
      })) {
        yield chunk.event;
        if (chunk.utterance) {
          const m = getMeeting(meetingId)!;
          updateMeeting(meetingId, { utterances: [...m.utterances, chunk.utterance] });
        }
      }
    }

    updateMeeting(meetingId, { phase: "done" });
    yield { type: "done" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "会议执行失败";
    updateMeeting(meetingId, { phase: "error", error: message });
    yield { type: "error", message };
  }
}
