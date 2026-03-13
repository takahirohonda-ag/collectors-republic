"use client";

import { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";
import { Database } from "lucide-react";

interface Transaction {
  id: string;
  user: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  purchase: { label: "Coin Purchase", color: "text-green-400" },
  spend: { label: "Pack Open", color: "text-amber-400" },
  sell_back: { label: "Sell Back", color: "text-blue-400" },
  refund: { label: "Refund", color: "text-red-400" },
  bonus: { label: "Bonus", color: "text-purple-400" },
};

export default function AdminSalesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("all");
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/transactions?type=${filter}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setTransactions(data.transactions);
        setIsDbConnected(data.isDbConnected);
      });
  }, [filter]);

  const totalPurchases = transactions.filter((t) => t.type === "purchase").reduce((s, t) => s + t.amount, 0);
  const totalSpend = transactions.filter((t) => t.type === "spend").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transaction History</h1>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${isDbConnected ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
          <Database className="h-3 w-3" />
          {isDbConnected ? "Live" : "Mock"}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted mb-1">Total Purchased</p>
          <p className="text-lg font-bold text-green-400">{formatNumber(totalPurchases)} Coins</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted mb-1">Total Spent</p>
          <p className="text-lg font-bold text-amber-400">{formatNumber(totalSpend)} Coins</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {["all", "purchase", "spend", "sell_back"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filter === type
                ? "bg-red-500/10 text-red-400"
                : "bg-card text-muted hover:text-foreground"
            }`}
          >
            {type === "all" ? "All" : typeLabels[type]?.label || type}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {transactions.map((tx) => {
            const typeInfo = typeLabels[tx.type] || { label: tx.type, color: "text-muted" };
            return (
              <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-card/50">
                <div>
                  <p className="text-sm font-medium">{tx.user}</p>
                  <p className="text-xs text-muted">{tx.description || typeInfo.label}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {tx.amount > 0 ? "+" : ""}{formatNumber(tx.amount)} Coins
                  </p>
                  <p className="text-[10px] text-muted">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {transactions.length === 0 && (
          <p className="text-center text-sm text-muted py-8">No transactions found</p>
        )}
      </div>
    </div>
  );
}
