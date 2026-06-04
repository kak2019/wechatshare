"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BubbleMarkdown } from "@/components/tuanzi/BubbleMarkdown";
import { RoleSeat, type SeatRole } from "@/components/tuanzi/RoleSeat";
import { UtteranceBubble, type BubbleMessage } from "@/components/tuanzi/UtteranceBubble";
import { TUANZI_PAGE } from "@/content/site";
import type { SseEvent } from "@/lib/tuanzi/types";

type RolesPayload = {
  host: SeatRole & { configured: boolean };
  scout: { id: string; name: string; modelLabel: string; configured: boolean } | null;
  roles: (SeatRole & { configured: boolean })[];
};

type ConfigPayload = {
  providers: { id: string; label: string; configured: boolean }[];
  canStartMeeting: boolean;
  hasAnyKey: boolean;
};

function upsertMessage(list: BubbleMessage[], patch: Partial<BubbleMessage> & { id: string }): BubbleMessage[] {
  const i = list.findIndex((m) => m.id === patch.id);
  if (i < 0) {
    return [
      ...list,
      {
        id: patch.id,
        roleId: patch.roleId ?? "",
        roleName: patch.roleName ?? "",
        modelLabel: patch.modelLabel ?? "",
        avatar: patch.avatar,
        accent: patch.accent,
        phase: patch.phase ?? "",
        round: patch.round ?? 0,
        content: patch.content ?? "",
        streaming: patch.streaming,
        isHost: patch.isHost,
        isEvidence: patch.isEvidence,
      },
    ];
  }
  const next = [...list];
  next[i] = { ...next[i], ...patch };
  return next;
}

export function RoundtableClient() {
  const [config, setConfig] = useState<ConfigPayload | null>(null);
  const [rolesData, setRolesData] = useState<RolesPayload | null>(null);
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<BubbleMessage[]>([]);
  const [minutes, setMinutes] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [minutesOpen, setMinutesOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cfgRes, rolesRes] = await Promise.all([
        fetch("/api/tuanzi/config"),
        fetch("/api/tuanzi/roles"),
      ]);
      const cfg = (await cfgRes.json()) as ConfigPayload;
      const roles = (await rolesRes.json()) as RolesPayload & { ok: boolean };
      if (cancelled) return;
      setConfig(cfg);
      if (roles.ok) {
        setRolesData(roles);
        const defaults = roles.roles.filter((r) => r.configured).map((r) => r.id);
        setSelected(new Set(defaults.slice(0, 2)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const host = rolesData?.host;
  const scout = rolesData?.scout;

  const seats = useMemo(() => {
    if (!rolesData) return [];
    return [rolesData.host, ...rolesData.roles];
  }, [rolesData]);

  const toggleRole = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSseEvent = useCallback(
    (event: SseEvent) => {
      if (event.type === "evidence_start") {
        setActiveRoleId(event.roleId);
        setMessages((m) =>
          upsertMessage(m, {
            id: "evidence",
            roleId: event.roleId,
            roleName: event.roleName,
            modelLabel: event.modelLabel,
            phase: "evidence",
            round: 0,
            content: "",
            streaming: true,
            isEvidence: true,
            avatar: "/tuanzi/avatars/scout.svg",
            accent: "#6ec8ff",
          }),
        );
        return;
      }
      if (event.type === "evidence_delta") {
        setMessages((m) =>
          upsertMessage(m, {
            id: "evidence",
            content: (m.find((x) => x.id === "evidence")?.content ?? "") + event.delta,
          }),
        );
        return;
      }
      if (event.type === "evidence_done") {
        setMessages((m) =>
          upsertMessage(m, {
            id: "evidence",
            content: event.content,
            streaming: false,
          }),
        );
        setActiveRoleId(null);
        return;
      }
      if (event.type === "turn_start") {
        setActiveRoleId(event.roleId);
        const seat = seats.find((s) => s.id === event.roleId);
        setMessages((m) =>
          upsertMessage(m, {
            id: event.utteranceId,
            roleId: event.roleId,
            roleName: event.roleName,
            modelLabel: event.modelLabel,
            phase: event.phase,
            round: event.round,
            content: "",
            streaming: true,
            isHost: event.roleId === host?.id,
            avatar: seat?.avatar,
            accent: seat?.accent,
          }),
        );
        return;
      }
      if (event.type === "turn_delta") {
        setMessages((m) => {
          const cur = m.find((x) => x.id === event.utteranceId);
          return upsertMessage(m, {
            id: event.utteranceId,
            content: (cur?.content ?? "") + event.delta,
          });
        });
        return;
      }
      if (event.type === "turn_end") {
        setMessages((m) =>
          upsertMessage(m, {
            id: event.utteranceId,
            content: event.content,
            streaming: false,
          }),
        );
        setActiveRoleId(null);
        return;
      }
      if (event.type === "minutes") {
        setMinutes(event.content);
        return;
      }
      if (event.type === "error") {
        setError(event.message);
        setRunning(false);
        setActiveRoleId(null);
      }
      if (event.type === "done") {
        setRunning(false);
        setActiveRoleId(null);
      }
    },
    [host?.id, seats],
  );

  const startMeeting = async () => {
    if (!topic.trim() || selected.size < 1) return;
    setError(null);
    setMessages([]);
    setMinutes("");
    setRunning(true);

    const res = await fetch("/api/tuanzi/meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topic.trim(),
        participantIds: [...selected],
        maxRounds: 2,
      }),
    });
    const json = (await res.json()) as { ok: boolean; meetingId?: string; error?: string };
    if (!json.ok || !json.meetingId) {
      setError(json.error ?? "创建会议失败");
      setRunning(false);
      return;
    }

    const es = new EventSource(`/api/tuanzi/meeting/${json.meetingId}/stream`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as SseEvent;
        handleSseEvent(data);
        if (data.type === "done" || data.type === "error") es.close();
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      setError("连接中断，请重试");
      setRunning(false);
      es.close();
    };
  };

  const canStart = config?.canStartMeeting && topic.trim() && selected.size > 0 && !running;

  return (
    <section className="relative mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-amber-800/70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {TUANZI_PAGE.eyebrow}
      </motion.p>
      <motion.h1
        className="mt-4 text-center text-4xl font-semibold tracking-tight sm:text-5xl"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {TUANZI_PAGE.title}
      </motion.h1>
      <motion.p
        className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-stone-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {TUANZI_PAGE.subtitle}
      </motion.p>

      {!config?.hasAnyKey && (
        <p className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-center text-sm text-amber-900/80">
          {TUANZI_PAGE.noKeyHint}
        </p>
      )}

      {rolesData && (
        <div className="mt-10">
          <p className="mb-3 text-center text-xs text-stone-500">{TUANZI_PAGE.seatsLabel}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {host && (
              <RoleSeat role={host} disabled />
            )}
            {scout && (
              <div className="flex flex-col items-center gap-1 rounded-2xl border border-sky-200/60 bg-sky-50/50 px-4 py-3">
                <span className="text-xs font-semibold text-sky-800">{scout.name}</span>
                <span className="text-[10px] text-sky-600">{scout.modelLabel} · 联网</span>
                {!scout.configured && (
                  <span className="text-[9px] text-rose-500">未配置 MIMO_API_KEY</span>
                )}
              </div>
            )}
            {rolesData.roles.map((r) => (
              <RoleSeat
                key={r.id}
                role={r}
                selected={selected.has(r.id)}
                active={activeRoleId === r.id}
                disabled={!r.configured || running}
                onToggle={() => toggleRole(r.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <label className="block text-xs font-medium text-stone-500">{TUANZI_PAGE.topicLabel}</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          disabled={running}
          placeholder={TUANZI_PAGE.topicPlaceholder}
          className="mt-2 w-full resize-none rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3 text-sm text-stone-800 shadow-sm outline-none focus:border-amber-300/80"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <motion.button
          type="button"
          disabled={!canStart}
          onClick={startMeeting}
          whileHover={canStart ? { scale: 1.02 } : undefined}
          whileTap={canStart ? { scale: 0.98 } : undefined}
          className="rounded-full bg-amber-400 px-8 py-2.5 text-sm font-semibold text-stone-900 shadow-md transition-opacity disabled:opacity-40"
        >
          {running ? TUANZI_PAGE.running : TUANZI_PAGE.start}
        </motion.button>
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-rose-600">{error}</p>
      )}

      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-12 space-y-6 sm:space-y-7"
          >
            <h2 className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
              {TUANZI_PAGE.transcript}
            </h2>
            <div className="mx-auto flex max-w-3xl flex-col gap-5 sm:gap-6">
              {messages.map((msg, i) => (
                <UtteranceBubble key={msg.id} msg={msg} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {minutes && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-[#fff9eb] p-5 shadow-[0_10px_40px_rgba(255,201,60,0.12)] sm:p-6"
        >
          <button
            type="button"
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-amber-900/90"
            onClick={() => setMinutesOpen((o) => !o)}
          >
            <span>{TUANZI_PAGE.minutesTitle}</span>
            <span className="text-xs text-amber-700/60">{minutesOpen ? "收起" : "展开"}</span>
          </button>
          {minutesOpen && (
            <div className="mt-4 border-t border-amber-200/60 pt-4">
              <BubbleMarkdown content={minutes} variant="minutes" />
            </div>
          )}
        </motion.div>
      )}

      {config && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {config.providers.map((p) => (
            <span
              key={p.id}
              className={[
                "rounded-full px-2 py-1 text-[10px]",
                p.configured ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-400",
              ].join(" ")}
            >
              {p.label}
              {p.configured ? " ✓" : ""}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
