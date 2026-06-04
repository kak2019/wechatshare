import { NextResponse } from "next/server";

import { isProviderConfigured } from "@/lib/tuanzi/providers";
import { getHostRole, listRoles, listSelectableRoles } from "@/lib/tuanzi/role-loader";

export const dynamic = "force-dynamic";

export async function GET() {
  const host = getHostRole();
  const selectable = listSelectableRoles().map((r) => ({
    id: r.id,
    name: r.name,
    title: r.title,
    avatar: r.avatar,
    accent: r.accent,
    modelLabel: r.modelLabel,
    provider: r.provider,
    configured: isProviderConfigured(r.provider),
  }));

  const scout = listRoles().find((r) => r.capabilities.includes("web_search"));

  return NextResponse.json({
    ok: true,
    host: {
      id: host.id,
      name: host.name,
      title: host.title,
      avatar: host.avatar,
      accent: host.accent,
      modelLabel: host.modelLabel,
      configured: isProviderConfigured(host.provider),
    },
    scout: scout
      ? {
          id: scout.id,
          name: scout.name,
          modelLabel: scout.modelLabel,
          configured: isProviderConfigured(scout.provider),
        }
      : null,
    roles: selectable,
  });
}
