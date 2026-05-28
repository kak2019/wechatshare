"use client";

import { useCallback } from "react";

import { PROVIDER_PRESETS } from "@/lib/ai-chat/providers";
import { applyProviderPreset } from "@/lib/ai-chat/storage";
import type { ChatSettings } from "@/lib/ai-chat/types";

type ChatSettingsPanelProps = {
  open: boolean;
  settings: ChatSettings;
  onClose: () => void;
  onChange: (settings: ChatSettings) => void;
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[var(--foreground)]">{label}</span>
      {children}
      {hint && <span className="block text-[10px] leading-relaxed text-[var(--mute)]">{hint}</span>}
    </label>
  );
}

export function ChatSettingsPanel({
  open,
  settings,
  onClose,
  onChange,
}: ChatSettingsPanelProps) {
  const update = useCallback(
    (patch: Partial<ChatSettings>) => {
      onChange({ ...settings, ...patch });
    },
    [onChange, settings],
  );

  const updateWebSearch = useCallback(
    (patch: Partial<ChatSettings["webSearch"]>) => {
      onChange({
        ...settings,
        webSearch: { ...settings.webSearch, ...patch },
      });
    },
    [onChange, settings],
  );

  const updateLocation = useCallback(
    (patch: Partial<ChatSettings["webSearch"]["userLocation"]>) => {
      onChange({
        ...settings,
        webSearch: {
          ...settings.webSearch,
          userLocation: { ...settings.webSearch.userLocation, ...patch },
        },
      });
    },
    [onChange, settings],
  );

  const handleProviderChange = useCallback(
    (providerId: ChatSettings["providerId"]) => {
      onChange(applyProviderPreset(settings, providerId));
    },
    [onChange, settings],
  );

  if (!open) return null;

  const preset = PROVIDER_PRESETS.find((p) => p.id === settings.providerId);

  return (
    <>
      <button
        type="button"
        aria-label="关闭设置"
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-black/[0.06] bg-[var(--background)] shadow-xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <h2 className="text-base font-semibold">聊天设置</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs text-[var(--mute)] transition hover:bg-black/[0.04]"
          >
            关闭
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Field label="模型提供商">
            <select
              value={settings.providerId}
              onChange={(e) =>
                handleProviderChange(e.target.value as ChatSettings["providerId"])
              }
              className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
            >
              {PROVIDER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {preset?.description && (
              <span className="block text-[10px] text-[var(--mute)]">{preset.description}</span>
            )}
          </Field>

          <Field label="API Key" hint="仅保存在本机浏览器，经服务端转发请求">
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              placeholder="输入 API Key"
              className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
            />
          </Field>

          <Field label="Base URL">
            <input
              type="url"
              value={settings.baseUrl}
              onChange={(e) => update({ baseUrl: e.target.value })}
              className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
            />
          </Field>

          <Field label="鉴权方式">
            <select
              value={settings.authStyle}
              onChange={(e) =>
                update({ authStyle: e.target.value as ChatSettings["authStyle"] })
              }
              className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
            >
              <option value="api-key">api-key 请求头（小米 MIMO）</option>
              <option value="bearer">Authorization Bearer</option>
            </select>
          </Field>

          <Field label="模型名称">
            <input
              type="text"
              value={settings.model}
              onChange={(e) => update({ model: e.target.value })}
              className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Temperature">
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.temperature}
                onChange={(e) => update({ temperature: Number(e.target.value) })}
                className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
              />
            </Field>
            <Field label="Top P">
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings.topP}
                onChange={(e) => update({ topP: Number(e.target.value) })}
                className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
              />
            </Field>
          </div>

          <Field label="最大输出 Token">
            <input
              type="number"
              min="1"
              max="8192"
              value={settings.maxCompletionTokens}
              onChange={(e) => update({ maxCompletionTokens: Number(e.target.value) })}
              className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.stream}
              onChange={(e) => update({ stream: e.target.checked })}
              className="rounded"
            />
            启用流式输出
          </label>

          <div className="rounded-2xl border border-black/[0.06] bg-[var(--paper)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">联网搜索 (web_search)</h3>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={settings.webSearch.enabled}
                  onChange={(e) => updateWebSearch({ enabled: e.target.checked })}
                  className="rounded"
                />
                启用
              </label>
            </div>
            {preset?.webSearchNote && (
              <p className="text-[10px] leading-relaxed text-amber-800/80">{preset.webSearchNote}</p>
            )}
            {settings.webSearch.enabled && (
              <>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={settings.webSearch.forceSearch}
                    onChange={(e) => updateWebSearch({ forceSearch: e.target.checked })}
                    className="rounded"
                  />
                  force_search（强制联网）
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="max_keyword">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.webSearch.maxKeyword}
                      onChange={(e) =>
                        updateWebSearch({ maxKeyword: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-black/[0.08] bg-[var(--background)] px-3 py-2 text-sm outline-none"
                    />
                  </Field>
                  <Field label="limit">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.webSearch.limit}
                      onChange={(e) => updateWebSearch({ limit: Number(e.target.value) })}
                      className="w-full rounded-xl border border-black/[0.08] bg-[var(--background)] px-3 py-2 text-sm outline-none"
                    />
                  </Field>
                </div>
                <Field label="国家 (country)">
                  <input
                    type="text"
                    value={settings.webSearch.userLocation.country}
                    onChange={(e) => updateLocation({ country: e.target.value })}
                    className="w-full rounded-xl border border-black/[0.08] bg-[var(--background)] px-3 py-2 text-sm outline-none"
                  />
                </Field>
                <Field label="地区 (region)">
                  <input
                    type="text"
                    value={settings.webSearch.userLocation.region}
                    onChange={(e) => updateLocation({ region: e.target.value })}
                    className="w-full rounded-xl border border-black/[0.08] bg-[var(--background)] px-3 py-2 text-sm outline-none"
                  />
                </Field>
                <Field label="城市 (city)">
                  <input
                    type="text"
                    value={settings.webSearch.userLocation.city}
                    onChange={(e) => updateLocation({ city: e.target.value })}
                    className="w-full rounded-xl border border-black/[0.08] bg-[var(--background)] px-3 py-2 text-sm outline-none"
                  />
                </Field>
              </>
            )}
          </div>

          <Field label="Thinking（小米 MIMO）">
            <select
              value={settings.thinking.type}
              onChange={(e) =>
                update({
                  thinking: {
                    type: e.target.value as ChatSettings["thinking"]["type"],
                  },
                })
              }
              className="w-full rounded-xl border border-black/[0.08] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-amber-500/50"
            >
              <option value="disabled">disabled</option>
              <option value="enabled">enabled</option>
            </select>
          </Field>

          <p className="text-[10px] leading-relaxed text-[var(--mute)]">
            请勿填写不可信的第三方 API 地址。API Key 经本站服务端转发至上游，不会写入服务器磁盘。
          </p>
        </div>
      </div>
    </>
  );
}
