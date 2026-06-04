import { NextResponse } from "next/server";

import { listProviderConfigs } from "@/lib/tuanzi/providers";
import { getWebSearchRole } from "@/lib/tuanzi/role-loader";

export const dynamic = "force-dynamic";

export async function GET() {
  const providers = listProviderConfigs();
  const scout = getWebSearchRole();
  const canStart =
    providers.some((p) => p.configured) &&
    providers.filter((p) => p.configured).length >= 1 &&
    (!scout || providers.find((p) => p.id === scout.provider)?.configured);

  return NextResponse.json({
    ok: true,
    providers,
    webSearchRoleId: scout?.id ?? null,
    canStartMeeting: providers.filter((p) => p.configured).length >= 2,
    hasAnyKey: providers.some((p) => p.configured),
  });
}
