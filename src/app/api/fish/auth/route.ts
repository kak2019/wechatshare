import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isValidPassword, isValidUsername } from "@/lib/fish/auth-crypto";
import {
  SESSION_COOKIE,
  getUserByToken,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/fish/server-store";

export const dynamic = "force-dynamic";

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  const user = await getUserByToken(token);
  if (!user) return NextResponse.json({ ok: true, loggedIn: false });
  return NextResponse.json({
    ok: true,
    loggedIn: true,
    user: { id: user.id, username: user.username, displayName: user.displayName },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: string;
      username?: string;
      password?: string;
      displayName?: string;
    };

    if (body.action === "logout") {
      const jar = await cookies();
      const token = jar.get(SESSION_COOKIE)?.value ?? "";
      if (token) await logoutUser(token);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
      return res;
    }

    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    const displayName = body.displayName?.trim() ?? username;

    if (!isValidUsername(username)) {
      return NextResponse.json({ ok: false, error: "用户名 2-16 位，支持中文/字母/数字" }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json({ ok: false, error: "密码 4-32 位" }, { status: 400 });
    }

    const result =
      body.action === "register"
        ? await registerUser(username, password, displayName)
        : await loginUser(username, password);

    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        id: result.user.id,
        username: result.user.username,
        displayName: result.user.displayName,
      },
    });
    setSessionCookie(res, result.token);
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "服务器错误" }, { status: 500 });
  }
}
