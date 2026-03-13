import { formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, Users, Package, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "$12,450", change: "+12.5%", icon: DollarSign, color: "text-green-400" },
  { label: "Total Users", value: "1,234", change: "+48", icon: Users, color: "text-blue-400" },
  { label: "Packs Opened", value: "8,921", change: "+320 today", icon: Package, color: "text-amber-400" },
  { label: "Avg. Order", value: "$28.50", change: "+3.2%", icon: TrendingUp, color: "text-purple-400" },
];

const recentActivity = [
  { user: "CryptoKnight", action: "Opened Pokemon Elite Pack", time: "2m ago", amount: "+500 coins" },
  { user: "ZenTrader", action: "Purchased 1,000 coins", time: "5m ago", amount: "$85" },
  { user: "CRYPTOWHALE", action: "Sold back Charizard GX", time: "8m ago", amount: "68 coins" },
  { user: "CardMaster99", action: "Requested shipping", time: "12m ago", amount: "2 cards" },
  { user: "NewCollector", action: "Signed up", time: "15m ago", amount: "" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className={`text-xs ${stat.color}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-card border border-border">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center">
                  <span className="text-xs">👤</span>
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
