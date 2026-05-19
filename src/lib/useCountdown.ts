"use client";

import { useSyncExternalStore } from "react";

import { ANNIVERSARIES, ANNIVERSARY_YEAR_LABEL, RELATIONSHIP_START } from "@/content/site";

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

function pickNextAnniversary(now: Date) {
  const year = now.getFullYear();
  const candidates: Array<{ label: string; emoji: string; when: Date }> = [];
  for (const a of ANNIVERSARIES) {
    const md = a.date.slice(5);
    const tryYear = new Date(`${year}-${md}T00:00:00+08:00`);
    if (tryYear.getTime() < now.getTime()) {
      candidates.push({
        label: a.label,
        emoji: a.emoji,
        when: new Date(`${year + 1}-${md}T00:00:00+08:00`),
      });
    } else {
      candidates.push({ label: a.label, emoji: a.emoji, when: tryYear });
    }
  }
  const start = new Date(RELATIONSHIP_START);
  const annivThisYear = new Date(
    `${year}-${RELATIONSHIP_START.slice(5, 10)}T00:00:00+08:00`,
  );
  const annivWhen =
    annivThisYear.getTime() < now.getTime()
      ? new Date(
          `${year + 1}-${RELATIONSHIP_START.slice(5, 10)}T00:00:00+08:00`,
        )
      : annivThisYear;
  const yearsSince = annivWhen.getFullYear() - start.getFullYear();
  candidates.push({
    label: ANNIVERSARY_YEAR_LABEL.replace("{years}", String(yearsSince)),
    emoji: "💞",
    when: annivWhen,
  });

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

  const next = pickNextAnniversary(now);
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
