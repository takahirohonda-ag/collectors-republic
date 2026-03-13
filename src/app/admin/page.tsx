"use client";

import { useState, useEffect } from "react";
import { DollarSign, Users, Package, Truck, Database } from "lucide-react";

interface Stats {
  totalRevenueAed: number;
  totalUsers: number;
  packsOpened: number;
  pendingShipments: number;
  revenueByProvider: { provider: string; totalAed: number; count: number }[];
  revenueByCurrency: { currency: string; total: number; totalAed: number; count: number }[];
  recentActivity: { user: string; action: string; time: string; amount: string }[];
  isDbConnected: boolean;
}

function formatAed(fils: number): string {
  return `AED ${(fils / 100).toLocaleString("en-AE", { minimumFractionDigits: 2 })}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-center text-muted">Loading...</div>;

  const statCards = [
    { label: "Total Revenue", value: formatAed(stats.totalRevenueAed), icon: DollarSign, color: "text-green-400" },
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-400" },
    { label: "Packs Opened", value: stats.packsOpened.toLocaleString(), icon: Package, color: "text-amber-400" },
    { label: "Pending Shipping", value: String(stats.pendingShipments), icon: Truck, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${stats.isDbConnected ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
          <Database className="h-3 w-3" />
          {stats.isDbConnected ? "DB Connected" : "Mock Data"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue by currency breakdown */}
      {stats.revenueByCurrency.length > 0 && (
        <div className="rounded-xl bg-card border border-border">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold">Revenue by Currency</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.revenueByCurrency.map((item) => (
              <div key={item.currency} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-400">{item.currency}</span>
                  <span className="text-xs text-muted">{item.count} payments</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatAed(item.totalAed)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card border border-border">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {stats.recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold">{item.user[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{item.user}</p>
                  <p className="text-xs text-muted">{item.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">{item.time}</p>
                {item.amount && <p className="text-xs font-medium">{item.amount}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
