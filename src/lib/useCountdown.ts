"use client";

import { useSyncExternalStore } from "react";

import {
  ANNIVERSARIES,
  ANNIVERSARY_YEAR_LABEL,
  DAY_MILESTONE_LABEL,
  DAY_MILESTONES,
  RELATIONSHIP_START,
} from "@/content/site";

export type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  nextAnniversary: {
    label: string;
    emoji: string;
    daysLeft: number;
    dateLabel: string;
  } | null;
};

const SERVER_SNAPSHOT: CountdownState = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  nextAnniversary: null,
};

let cached: CountdownState = SERVER_SNAPSHOT;
let cachedSecondBucket = -1;

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

function getClientSnapshot(): CountdownState {
  const bucket = Math.floor(Date.now() / 1000);
  if (bucket === cachedSecondBucket) return cached;
  cachedSecondBucket = bucket;
  cached = compute();
  return cached;
}

function getServerSnapshot(): CountdownState {
  return SERVER_SNAPSHOT;
}

export function useCountdown(): CountdownState {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

type Candidate = { label: string; emoji: string; when: Date };

/** 根据在一起起始日，自动生成「N 周年」下一次日期 */
function nextYearAnniversary(now: Date, start: Date): Candidate {
  const month = String(start.getMonth() + 1).padStart(2, "0");
  const day = String(start.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  let when = new Date(`${year}-${month}-${day}T00:00:00+08:00`);
  if (when.getTime() <= now.getTime()) {
    when = new Date(`${year + 1}-${month}-${day}T00:00:00+08:00`);
  }
  const yearsSince = when.getFullYear() - start.getFullYear();
  return {
    label: ANNIVERSARY_YEAR_LABEL.replace("{years}", String(yearsSince)),
    emoji: "💞",
    when,
  };
}

/** 根据已在一起天数，自动找下一个整百日 / 里程碑日 */
function nextDayMilestone(now: Date, start: Date, daysTogether: number): Candidate | null {
  const nextDays = DAY_MILESTONES.find((d) => d > daysTogether);
  if (nextDays == null) return null;
  const when = new Date(start.getTime() + nextDays * 86_400_000);
  // 若刚好落在过去（时区边界），跳过
  if (when.getTime() <= now.getTime()) return null;
  return {
    label: DAY_MILESTONE_LABEL.replace("{days}", String(nextDays)),
    emoji: "✨",
    when,
  };
}

/** 额外日子（生日、节日等）：每年按月日循环 */
function nextCustomDates(now: Date): Candidate[] {
  const year = now.getFullYear();
  const out: Candidate[] = [];
  for (const a of ANNIVERSARIES) {
    const md = a.date.slice(5); // MM-DD
    let when = new Date(`${year}-${md}T00:00:00+08:00`);
    if (when.getTime() <= now.getTime()) {
      when = new Date(`${year + 1}-${md}T00:00:00+08:00`);
    }
    out.push({ label: a.label, emoji: a.emoji, when });
  }
  return out;
}

function pickNextAnniversary(now: Date, start: Date, daysTogether: number) {
  const candidates: Candidate[] = [
    nextYearAnniversary(now, start),
    ...nextCustomDates(now),
  ];
  const milestone = nextDayMilestone(now, start, daysTogether);
  if (milestone) candidates.push(milestone);

  candidates.sort((a, b) => a.when.getTime() - b.when.getTime());
  return candidates[0] ?? null;
}

function compute(): CountdownState {
  const now = new Date();
  const start = new Date(RELATIONSHIP_START);
  const diff = Math.max(0, now.getTime() - start.getTime());
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const next = pickNextAnniversary(now, start, days);
  const nextAnniversary = next
    ? {
        label: next.label,
        emoji: next.emoji,
        daysLeft: Math.max(
          0,
          Math.ceil((next.when.getTime() - now.getTime()) / 86_400_000),
        ),
        dateLabel: `${next.when.getMonth() + 1}月${next.when.getDate()}日`,
      }
    : null;

  return { days, hours, minutes, seconds, nextAnniversary };
}
