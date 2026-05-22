"use client";

import { useEffect, useState } from "react";

import { fetchLeaderboard } from "@/lib/fish/api";
import type { LeaderboardEntry } from "@/lib/fish/types";

function formatGold(n: number) {
  return n.toLocaleString("zh-CN");
}

export function LeaderboardPanel({ currentPlayerId }: { currentPlayerId?: string }) {
  const [list, setList] = useState<LeaderboardEntry[]>([]);
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
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-black/[0.06]">
      <h2 className="text-lg font-semibold">🏆 通天塔排行榜</h2>
      <p className="mt-1 text-xs text-[var(--mute)]">按通天塔层数 → 金币 → 总钓获排序。记得输入名字！</p>

      {list.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--mute)]">暂无数据，输入名字抛竿后会自动上榜。</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-[var(--mute)]">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">渔夫</th>
                <th className="py-2 pr-2">塔层</th>
                <th className="py-2 pr-2">金币</th>
                <th className="py-2 pr-2">钓获</th>
                <th className="py-2">鱼竿</th>
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
                      isMe ? "bg-teal-50/80 font-medium" : "",
                      i < 3 ? "text-amber-700" : "",
                    ].join(" ")}
                  >
                    <td className="py-2 pr-2">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                    <td className="py-2 pr-2">{e.playerName}{isMe ? " (我)" : ""}</td>
                    <td className="py-2 pr-2">{e.towerFloor}</td>
                    <td className="py-2 pr-2">{formatGold(e.totalGold)}</td>
                    <td className="py-2 pr-2">{e.totalCatches}</td>
                    <td className="py-2">Lv.{e.rodLevel}</td>
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
