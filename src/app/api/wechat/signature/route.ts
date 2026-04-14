import { NextRequest, NextResponse } from "next/server";

const APP_ID = process.env.WECHAT_APP_ID || "";
const APP_SECRET = process.env.WECHAT_APP_SECRET || "";

let tokenCache = { value: "", expiresAt: 0 };
let ticketCache = { value: "", expiresAt: 0 };

async function getAccessToken(): Promise<string> {
  if (tokenCache.value && Date.now() < tokenCache.expiresAt) {
    return tokenCache.value;
  }
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.access_token) {
    tokenCache = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    };
    return data.access_token;
  }
  throw new Error(`获取 access_token 失败: ${JSON.stringify(data)}`);
}

async function getJsApiTicket(): Promise<string> {
  if (ticketCache.value && Date.now() < ticketCache.expiresAt) {
    return ticketCache.value;
  }
  const token = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.ticket) {
    ticketCache = {
      value: data.ticket,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    };
    return data.ticket;
  }
  throw new Error(`获取 jsapi_ticket 失败: ${JSON.stringify(data)}`);
}

function createNonceStr(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
  }

  try {
    const ticket = await getJsApiTicket();
    const nonceStr = createNonceStr();
    const timestamp = createTimestamp();

    const signStr = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = await sha1(signStr);

    return NextResponse.json({
      appId: APP_ID,
      timestamp,
      nonceStr,
      signature,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
