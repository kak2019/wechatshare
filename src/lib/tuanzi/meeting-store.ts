import type { Meeting } from "@/lib/tuanzi/types";

const meetings = new Map<string, Meeting>();

export function createMeeting(meeting: Meeting): void {
  meetings.set(meeting.id, meeting);
}

export function getMeeting(id: string): Meeting | undefined {
  return meetings.get(id);
}

export function updateMeeting(id: string, patch: Partial<Meeting>): Meeting | undefined {
  const current = meetings.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch };
  meetings.set(id, next);
  return next;
}
