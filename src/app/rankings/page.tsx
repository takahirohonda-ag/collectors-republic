"use client";

import { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Trophy, Coins, Star, Loader2 } from "lucide-react";
import { useUser } from "@/context/user-context";
import type { RankingUser, RankingsResponse } from "@/app/api/rankings/route";

type Tab = "topCollectors" | "bigSpenders" | "rareHunters";

const TABS: { value: Tab; label: string; icon: React.ReactNode; stat: string }[] = [
  { value: "topCollectors", label: "Top Collectors", icon: <Trophy className="h-4 w-4" />, stat: "Cards" },
  { value: "bigSpenders", label: "Big Spenders", icon: <Coins className="h-4 w-4" />, stat: "Coins Spent" },
  { value: "rareHunters", label: "Rare Hunters", icon: <Star className="h-4 w-4" />, stat: "Tier 4 Cards" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="w-7 text-center text-sm font-bold text-muted">{rank}</span>
  );
}

function TopPodium({
  entries,
  statLabel,
}: {
  entries: RankingUser[];
  statLabel: string;
}) {
  const [first, second, third] = entries;

  return (
    <div className="flex items-end justify-center gap-6 pt-4 pb-2">
      {/* 2nd place */}
      {second && (
        <div className="flex flex-col items-center gap-1">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center border-2 border-gray-400">
            <span className="text-lg">🥈</span>
          </div>
          <p className="text-xs font-medium text-center truncate max-w-[80px]">{second.username}</p>
          <p className="text-[10px] text-muted">{formatNumber(second.value)} {statLabel}</p>
        </div>
      )}

      {/* 1st place */}
      {first && (
        <div className="flex flex-col items-center gap-1 -mt-6">
          <Trophy className="h-5 w-5 text-amber-400" />
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-2 border-amber-400">
            <span className="text-2xl">👑</span>
          </div>
          <p className="text-sm font-bold text-center truncate max-w-[80px]">{first.username}</p>
          <p className="text-xs text-amber-400 font-medium">{formatNumber(first.value)} {statLabel}</p>
        </div>
      )}

      {/* 3rd place */}
      {third && (
        <div className="flex flex-col items-center gap-1">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center border-2 border-amber-700">
            <span className="text-lg">🥉</span>
          </div>
          <p className="text-xs font-medium text-center truncate max-w-[80px]">{third.username}</p>
          <p className="text-[10px] text-muted">{formatNumber(third.value)} {statLabel}</p>
        </div>
      )}
    </div>
  );
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("topCollectors");
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { coinBalance } = useUser();

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch("/api/rankings");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Keep null — will show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const tabConfig = TABS.find((t) => t.value === activeTab)!;
  const entries: RankingUser[] = data?.[activeTab] ?? [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Try to detect the current user in the leaderboard (heuristic: match by coinBalance or just highlight none)
  // We don't have userId on the client easily without an auth hook, so this is a visual placeholder.
  // In a real app, you'd compare against the authenticated user's id.

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-center">Rankings</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
              activeTab === tab.value
                ? "bg-red-500 text-white"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          No data available yet. Start collecting!
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <TopPodium entries={top3} statLabel={tabConfig.stat} />

          {/* Ranks 4–10 */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map((entry) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-3 rounded-xl bg-card border border-border p-3 transition-colors",
                  )}
                >
                  <div className="w-7 flex items-center justify-center">
                    <RankBadge rank={entry.rank} />
                  </div>

                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shrink-0">
                    <span className="text-sm">👤</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.username}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-amber-400">
                      {formatNumber(entry.value)}
                    </p>
                    <p className="text-[10px] text-muted">{tabConfig.stat}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {data && "isMock" in data && (data as { isMock?: boolean }).isMock && (
        <p className="text-center text-[10px] text-muted">
          Showing sample data · Connect a database for live rankings
        </p>
      )}
    </div>
  );
}
