"use client";

import { useEffect, useState } from "react";

import { YANG_PAGE } from "@/content/yanglegeyang";
import { fetchLeaderboard } from "@/lib/yanglegeyang/api";
import type { YangLeaderboardEntry } from "@/lib/yanglegeyang/types";

export function YangLeaderboardPanel({ currentPlayerId }: { currentPlayerId?: string }) {
  const [list, setList] = useState<YangLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then((data) => {
      setList(data);
      setLoading(false);
    });
    const t = setInterval(() => fetchLeaderboard().then(setList), 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return <p className="py-8 text-center text-sm text-[var(--mute)]">加载排行榜…</p>;
  }

  return (
    <div className="overflow-y-auto rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">{YANG_PAGE.rankTitle}</h2>
      <p className="mt-1 text-xs text-[var(--mute)]">{YANG_PAGE.rankHint}</p>

      {list.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--mute)]">暂无数据，登录并过关后自动上榜。</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-[var(--mute)]">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">玩家</th>
                <th className="py-2 pr-2">通关轮</th>
                <th className="py-2 pr-2">胜场</th>
                <th className="py-2">通关</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 30).map((e, i) => {
                const isMe = e.playerId === currentPlayerId;
                return (
                  <tr
                    key={e.playerId}
                    className={[
                      "border-b border-gray-50",
                      isMe ? "bg-amber-50/80 font-medium" : "",
                      i < 3 ? "text-amber-700" : "",
                    ].join(" ")}
                  >
                    <td className="py-2 pr-2">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                    <td className="py-2 pr-2">{e.playerName}{isMe ? " (我)" : ""}</td>
                    <td className="py-2 pr-2">{e.totalClears}</td>
                    <td className="py-2 pr-2">{e.totalWins}</td>
                    <td className="py-2">{e.totalClears}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
