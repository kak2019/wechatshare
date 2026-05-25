"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import type { AuthUser } from "@/lib/fish/api";

interface LoginPanelProps {
  user: AuthUser | null;
  onLogin: (username: string, password: string) => Promise<string | null>;
  onRegister: (username: string, password: string, displayName: string) => Promise<string | null>;
  onLogout: () => void;
  /** 移动端：未登录时默认收起，不挡游戏区域 */
  compact?: boolean;
}

export function LoginPanel({ user, onLogin, onRegister, onLogout, compact }: LoginPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(compact ? !!user : !user);

  if (!user && compact && !expanded) {
    return (
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-black/[0.06]">
        <span className="text-xs text-[var(--mute)]">未登录 · 本地可玩，登录后云存档</span>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-h-[44px] shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-300 active:bg-teal-50"
        >
          登录
        </button>
      </div>
    );
  }

  if (user && !expanded) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-teal-50 px-4 py-2 ring-1 ring-teal-200">
        <span className="text-sm">
          ☁️ 已登录：<strong>{user.displayName}</strong>
          <span className="ml-2 text-xs text-[var(--mute)]">进度自动云存档</span>
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg px-3 py-1 text-xs text-teal-700 ring-1 ring-teal-300 hover:bg-teal-100"
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.06]"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{user ? "账号" : "☁️ 登录云存档"}</h3>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={mode === "login" ? "font-semibold text-teal-600" : "text-[var(--mute)]"}
          >
            登录
          </button>
          <span className="text-[var(--mute)]">|</span>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={mode === "register" ? "font-semibold text-teal-600" : "text-[var(--mute)]"}
          >
            注册
          </button>
          {user && (
            <button type="button" onClick={() => setExpanded(false)} className="ml-2 text-[var(--mute)]">
              收起
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--mute)]">登录后进度保存在服务器，换设备也不丢。</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          className="min-w-[120px] flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {mode === "register" && (
          <input
            className="min-w-[120px] flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
            placeholder="渔夫昵称（排行榜显示）"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}
        <input
          type="password"
          className="min-w-[100px] flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError("");
            const err =
              mode === "register"
                ? await onRegister(username, password, displayName || username)
                : await onLogin(username, password);
            setLoading(false);
            if (err) setError(err);
          }}
          className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "…" : mode === "register" ? "注册并开始" : "登录"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </motion.div>
  );
}
