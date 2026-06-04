import fs from "fs";
import path from "path";

import matter from "gray-matter";

import { isProviderConfigured } from "@/lib/tuanzi/providers";
import type { ProviderId, RoleCapability, TuanziRole } from "@/lib/tuanzi/types";

const ROLES_DIR = path.join(process.cwd(), "content/tuanzi/roles");

function parseCapabilities(raw: unknown): RoleCapability[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((c): c is RoleCapability => c === "web_search");
}

function parseRole(filePath: string): TuanziRole {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const id = String(data.id ?? "").trim();
  if (!id) throw new Error(`角色文件缺少 id: ${filePath}`);

  const provider = String(data.provider ?? "").trim() as ProviderId;
  if (!["xiaomi", "siliconflow", "deepseek"].includes(provider)) {
    throw new Error(`角色 ${id} 的 provider 无效: ${data.provider}`);
  }

  return {
    id,
    name: String(data.name ?? id),
    title: String(data.title ?? ""),
    avatar: String(data.avatar ?? "/tuanzi/tuanzi-avatar.png"),
    accent: String(data.accent ?? "#ffc93c"),
    host: Boolean(data.host),
    provider,
    model: String(data.model ?? ""),
    modelLabel: String(data.modelLabel ?? data.model ?? provider),
    capabilities: parseCapabilities(data.capabilities),
    selectable: data.selectable !== false,
    systemPrompt: content.trim(),
  };
}

let cache: TuanziRole[] | null = null;

function loadAllRoles(): TuanziRole[] {
  if (cache) return cache;
  if (!fs.existsSync(ROLES_DIR)) {
    cache = [];
    return cache;
  }
  const files = fs.readdirSync(ROLES_DIR).filter((f) => f.endsWith(".md"));
  const roles = files.map((f) => parseRole(path.join(ROLES_DIR, f)));
  const hosts = roles.filter((r) => r.host);
  if (hosts.length !== 1 || hosts[0]?.id !== "tuanzi") {
    throw new Error("必须且仅能有一个 host: true 的角色，id 为 tuanzi");
  }
  const ids = new Set<string>();
  for (const r of roles) {
    if (ids.has(r.id)) throw new Error(`重复角色 id: ${r.id}`);
    ids.add(r.id);
  }
  cache = roles;
  return roles;
}

export function listRoles(): TuanziRole[] {
  return loadAllRoles();
}

export function getRole(id: string): TuanziRole | undefined {
  return loadAllRoles().find((r) => r.id === id);
}

export function getHostRole(): TuanziRole {
  const host = loadAllRoles().find((r) => r.host);
  if (!host) throw new Error("未找到主持人团子");
  return host;
}

export function getWebSearchRole(): TuanziRole | undefined {
  return loadAllRoles().find((r) => r.capabilities.includes("web_search"));
}

export function listSelectableRoles(): TuanziRole[] {
  return loadAllRoles().filter((r) => r.selectable && !r.host);
}

export function resolveParticipants(ids: string[]): TuanziRole[] {
  const all = loadAllRoles();
  const resolved: TuanziRole[] = [];
  for (const id of ids) {
    const role = all.find((r) => r.id === id);
    if (!role || role.host) continue;
    if (!isProviderConfigured(role.provider)) {
      throw new Error(`角色「${role.name}」的模型未配置 API Key`);
    }
    resolved.push(role);
  }
  if (resolved.length < 1) {
    throw new Error("请至少选择一位分析席参与者");
  }
  return resolved;
}

export function clearRoleCache(): void {
  cache = null;
}
