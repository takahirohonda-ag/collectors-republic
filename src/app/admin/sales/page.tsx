"use client";

import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const salesData = [
  { period: "Today", revenue: 1250, packs: 42, avgOrder: 29.76, change: 12.5 },
  { period: "This Week", revenue: 8450, packs: 284, avgOrder: 29.75, change: 8.3 },
  { period: "This Month", revenue: 32100, packs: 1089, avgOrder: 29.48, change: -2.1 },
  { period: "All Time", revenue: 124500, packs: 4231, avgOrder: 29.43, change: 0 },
];

const topPacks = [
  { name: "Pokemon Basic Pack", sold: 3245, revenue: 324500, share: 58 },
  { name: "Pokemon Elite Pack", sold: 1021, revenue: 510500, share: 28 },
  { name: "Pokemon Legendary Pack", sold: 312, revenue: 624000, share: 14 },
];

const recentTransactions = [
  { id: "t1", user: "CryptoKnight", type: "Coin Purchase", amount: 85, time: "2m ago" },
  { id: "t2", user: "ZenTrader", type: "Pack Open", amount: 100, time: "5m ago" },
  { id: "t3", user: "CRYPTOWHALE", type: "Coin Purchase", amount: 375, time: "8m ago" },
  { id: "t4", user: "CardMaster99", type: "Pack Open", amount: 500, time: "12m ago" },
  { id: "t5", user: "NewCollector", type: "Coin Purchase", amount: 10, time: "15m ago" },
];

export default function AdminSalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Sales Dashboard</h1>

      {/* Period stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {salesData.map((data) => (
          <div key={data.period} className="rounded-xl bg-card border border-border p-4">
            <p className="text-xs text-muted mb-1">{data.period}</p>
            <p className="text-lg font-bold">{formatCurrency(data.revenue)}</p>
            <div className="flex items-center gap-1 mt-1">
              {data.change > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400" />
              ) : data.change < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-400" />
              ) : null}
              {data.change !== 0 && (
                <span className={`text-xs ${data.change > 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.change > 0 ? "+" : ""}{data.change}%
                </span>
              )}
              <span className="text-xs text-muted ml-1">{formatNumber(data.packs)} packs</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue by pack */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <h2 className="text-sm font-semibold">Revenue by Pack</h2>
        {topPacks.map((pack) => (
          <div key={pack.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{pack.name}</span>
              <span className="font-medium">{formatCurrency(pack.revenue)}</span>
            </div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                style={{ width: `${pack.share}%` }}
              />
            </div>
            <p className="text-[10px] text-muted">{formatNumber(pack.sold)} sold &middot; {pack.share}% of revenue</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-card border-b border-border p-4">
          <h2 className="text-sm font-semibold">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-border">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{tx.user}</p>
                <p className="text-xs text-muted">{tx.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(tx.amount)}</p>
                <p className="text-[10px] text-muted">{tx.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
