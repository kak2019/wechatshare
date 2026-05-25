import type { PersonalityDef, Stats, StatKey } from "@/lib/soviet-vn/types";

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function applyStatDelta(stats: Stats, delta: Partial<Stats>): Stats {
  const next = { ...stats };
  for (const key of Object.keys(delta) as StatKey[]) {
    next[key] = clampStat(next[key] + (delta[key] ?? 0));
  }
  return next;
}

export function mergeBestStats(current: Stats, candidate: Stats): Stats {
  const next = { ...current };
  for (const key of Object.keys(current) as StatKey[]) {
    next[key] = Math.max(current[key], candidate[key]);
  }
  return next;
}

export function resolveEndingId(stats: Stats): string {
  const { authority, reform, integrity, welfare, idealism, diplomacy } = stats;

  if (authority >= 68 && welfare < 45) return "ending_c";
  if (reform >= 68 && integrity < 48) return "ending_b";
  if (authority >= 62 && reform < 42) return "ending_d";
  if (idealism >= 75 && integrity >= 65 && reform >= 55) return "ending_a";
  if (reform >= 55 && diplomacy >= 58) return "ending_b";
  if (authority >= 58) return "ending_d";
  return "ending_a";
}

export function canUnlockDream(
  unlockedEndings: string[],
  runHistory: { stats: Stats }[],
): boolean {
  const required = ["ending_a", "ending_b", "ending_c", "ending_d"];
  const allSeen = required.every((id) => unlockedEndings.includes(id));
  if (!allSeen) return false;

  return runHistory.some(
    (run) => run.stats.idealism >= 80 && run.stats.integrity >= 60,
  );
}

export function computePersonality(
  stats: Stats,
  personalities: PersonalityDef[],
): PersonalityDef {
  const ranked = (Object.keys(stats) as StatKey[])
    .map((key) => ({ key, value: stats[key] }))
    .sort((a, b) => b.value - a.value);

  const top = ranked[0]?.key;
  const second = ranked[1]?.key;

  const match = personalities.find((p) => {
    if (p.id === "andropov" && (top === "integrity" || top === "authority"))
      return true;
    if (p.id === "gorbachev" && (top === "reform" || second === "reform"))
      return true;
    if (p.id === "brezhnev" && top === "authority" && stats.reform < 55)
      return true;
    if (p.id === "yeltsin" && top === "reform" && stats.integrity < 50)
      return true;
    return false;
  });

  return match ?? personalities[0]!;
}

export function averageStats(runs: { stats: Stats }[]): Stats {
  if (runs.length === 0) {
    return {
      authority: 50,
      reform: 50,
      integrity: 50,
      welfare: 50,
      diplomacy: 50,
      idealism: 50,
    };
  }

  const sum = {
    authority: 0,
    reform: 0,
    integrity: 0,
    welfare: 0,
    diplomacy: 0,
    idealism: 0,
  };

  for (const run of runs) {
    for (const key of Object.keys(sum) as StatKey[]) {
      sum[key] += run.stats[key];
    }
  }

  const count = runs.length;
  return {
    authority: Math.round(sum.authority / count),
    reform: Math.round(sum.reform / count),
    integrity: Math.round(sum.integrity / count),
    welfare: Math.round(sum.welfare / count),
    diplomacy: Math.round(sum.diplomacy / count),
    idealism: Math.round(sum.idealism / count),
  };
}
