import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createNewSave, migrateSave } from "@/lib/yanglegeyang/engine";
import { loadCloudSave, saveCloudSave } from "@/lib/yanglegeyang/server-store";
import type { YangSave } from "@/lib/yanglegeyang/types";
import { SESSION_COOKIE, getUserByToken } from "@/lib/fish/server-store";

export const dynamic = "force-dynamic";

async function requireUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  return getUserByToken(token);
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  let save = await loadCloudSave(user.id);
  if (!save) {
    save = createNewSave(user.displayName);
    save.accountId = user.id;
    save.playerId = user.id;
    await saveCloudSave(user.id, save);
  }

  return NextResponse.json({
    ok: true,
    save,
    user: { id: user.id, displayName: user.displayName },
  });
}

export async function PUT(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { save?: Partial<YangSave> };
    if (!body.save) {
      return NextResponse.json({ ok: false, error: "缺少存档" }, { status: 400 });
    }

    const merged = migrateSave({
      ...body.save,
      accountId: user.id,
      playerId: user.id,
      playerName: body.save.playerName?.trim() || user.displayName,
    });

    const saved = await saveCloudSave(user.id, merged);
    return NextResponse.json({ ok: true, save: saved });
  } catch {
    return NextResponse.json({ ok: false, error: "存档失败" }, { status: 500 });
  }
}
