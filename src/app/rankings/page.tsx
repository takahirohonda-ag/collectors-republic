"use client";

import { useState } from "react";
import { rankings } from "@/data/mock";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, CheckCircle } from "lucide-react";

type Period = "daily" | "weekly" | "monthly" | "all";

const periods: { value: Period; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "all", label: "All Time" },
];

export default function RankingsPage() {
  const [period, setPeriod] = useState<Period>("monthly");

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* Period tabs */}
      <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              period === p.value
                ? "bg-blue-500 text-white"
                : "text-muted hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center">Rankings</h1>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 pt-4">
        {/* 2nd place */}
        {top3[1] && (
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-2 border-2 border-gray-400">
              <span className="text-lg">🥈</span>
            </div>
            <p className="text-xs font-medium text-center truncate max-w-[80px]">
              {top3[1].user.username}
            </p>
            <p className="text-[10px] text-muted">
              {formatNumber(top3[1].totalCoins)} Coins
            </p>
          </div>
        )}

        {/* 1st place */}
        {top3[0] && (
          <div className="flex flex-col items-center -mt-6">
            <Trophy className="h-6 w-6 text-amber-400 mb-1" />
            <div className="h-18 w-18 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-2 border-2 border-amber-400 p-1">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-center">
                {top3[0].user.username}
              </p>
              {top3[0].verified && (
                <CheckCircle className="h-3 w-3 text-blue-400" />
              )}
            </div>
            <p className="text-xs text-amber-400 font-medium">
              {formatNumber(top3[0].totalCoins)} Coins
            </p>
          </div>
        )}

        {/* 3rd place */}
        {top3[2] && (
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center mb-2 border-2 border-amber-700">
              <span className="text-lg">🥉</span>
            </div>
            <p className="text-xs font-medium text-center truncate max-w-[80px]">
              {top3[2].user.username}
            </p>
            <p className="text-[10px] text-muted">
              {formatNumber(top3[2].totalCoins)} Coins
            </p>
          </div>
        )}
      </div>

      {/* Rest of rankings */}
      <div className="space-y-2">
        {rest.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center gap-3 rounded-xl bg-card border border-border p-3"
          >
            <span className="w-6 text-center text-sm font-bold text-muted">
              {entry.rank}
            </span>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">{entry.user.username}</p>
                {entry.verified && (
                  <CheckCircle className="h-3 w-3 text-blue-400" />
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-amber-400">
                💰 {formatNumber(entry.totalCoins)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
