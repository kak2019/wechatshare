import { NextResponse } from "next/server";

import { createMeetingRecord } from "@/lib/tuanzi/engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      topic?: string;
      participantIds?: string[];
      maxRounds?: number;
    };

    const meeting = createMeetingRecord({
      topic: body.topic ?? "",
      participantIds: body.participantIds ?? [],
      maxRounds: body.maxRounds,
    });

    return NextResponse.json({ ok: true, meetingId: meeting.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建会议失败";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
