"use client";

import type { ChatSession } from "@/lib/ai-chat/types";

type ChatSidebarProps = {
  open: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export function ChatSidebar({
  open,
  sessions,
  activeSessionId,
  onClose,
  onSelect,
  onNew,
  onDelete,
  onDeleteAll,
}: ChatSidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="关闭侧边栏"
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-black/[0.06] bg-[var(--background)] transition-transform md:static md:z-0 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
          <h2 className="text-sm font-semibold">会话</h2>
          <button
            type="button"
            onClick={onNew}
            className="rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)] transition hover:opacity-85"
          >
            新建
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-[var(--mute)]">
              暂无会话记录
            </p>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => {
                const active = session.id === activeSessionId;
                return (
                  <li key={session.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(session.id);
                        onClose();
                      }}
                      className={[
                        "w-full rounded-xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-amber-100/80 text-[var(--foreground)]"
                          : "hover:bg-black/[0.04] text-[var(--foreground)]",
                      ].join(" ")}
                    >
                      <p className="truncate text-sm font-medium">{session.title}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--mute)]">
                        {formatTime(session.updatedAt)} · {session.messages.length} 条
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label="删除会话"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除「${session.title}」？`)) {
                          onDelete(session.id);
                        }
                      }}
                      className="absolute right-2 top-2 hidden rounded-md px-2 py-1 text-[10px] text-rose-600 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 md:block"
                    >
                      删除
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="border-t border-black/[0.06] p-3">
            <button
              type="button"
              onClick={() => {
                if (confirm("确定清空全部会话记录？")) onDeleteAll();
              }}
              className="w-full rounded-xl border border-rose-200/80 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              清空全部会话
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
