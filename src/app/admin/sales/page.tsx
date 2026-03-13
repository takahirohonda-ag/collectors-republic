"use client";

import { useState, useEffect } from "react";
import { Database } from "lucide-react";

interface PaymentRecord {
  id: string;
  user: string;
  provider: string;
  amount: number;
  currency: string;
  amountAed: number;
  coinsGranted: number;
  status: string;
  createdAt: string;
}

const providerLabels: Record<string, { label: string; color: string }> = {
  stripe: { label: "Stripe", color: "text-purple-400" },
  apple_pay: { label: "Apple Pay", color: "text-white" },
  google_pay: { label: "Google Pay", color: "text-blue-400" },
  crypto: { label: "Crypto", color: "text-amber-400" },
  bank_transfer: { label: "Bank Transfer", color: "text-green-400" },
};

function formatCurrency(amount: number, currency: string): string {
  const major = amount / 100;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(major);
}

export default function AdminSalesPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [providerFilter, setProviderFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (providerFilter !== "all") params.set("provider", providerFilter);
    if (currencyFilter !== "all") params.set("currency", currencyFilter);
    fetch(`/api/admin/payments?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments);
        setIsDbConnected(data.isDbConnected);
      });
  }, [providerFilter, currencyFilter]);

  const totalRevenueAed = payments.reduce((s, p) => s + p.amountAed, 0);
  const totalTransactions = payments.length;

  // Group by currency
  const byCurrency = payments.reduce<Record<string, { total: number; totalAed: number; count: number }>>((acc, p) => {
    if (!acc[p.currency]) acc[p.currency] = { total: 0, totalAed: 0, count: 0 };
    acc[p.currency].total += p.amount;
    acc[p.currency].totalAed += p.amountAed;
    acc[p.currency].count += 1;
    return acc;
  }, {});

  const currencies = ["all", ...new Set(payments.map((p) => p.currency))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Revenue</h1>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${isDbConnected ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
          <Database className="h-3 w-3" />
          {isDbConnected ? "Live" : "Mock"}
        </span>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-card border border-border p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-muted mb-1">Total Revenue (AED)</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenueAed, "AED")}</p>
          <p className="text-[10px] text-muted mt-1">{totalTransactions} transactions</p>
        </div>
        {Object.entries(byCurrency).map(([cur, data]) => (
          <div key={cur} className="rounded-xl bg-card border border-border p-4">
            <p className="text-xs text-muted mb-1">{cur}</p>
            <p className="text-lg font-bold">{formatCurrency(data.total, cur)}</p>
            <p className="text-[10px] text-muted mt-1">
              {cur !== "AED" && `≈ ${formatCurrency(data.totalAed, "AED")} · `}
              {data.count} txns
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted">Provider:</span>
          {["all", "stripe", "apple_pay", "google_pay", "crypto"].map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                providerFilter === p
                  ? "bg-red-500/10 text-red-400"
                  : "bg-card text-muted hover:text-foreground"
              }`}
            >
              {p === "all" ? "All" : providerLabels[p]?.label || p}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted">Currency:</span>
          {currencies.map((c) => (
            <button
              key={c}
              onClick={() => setCurrencyFilter(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                currencyFilter === c
                  ? "bg-red-500/10 text-red-400"
                  : "bg-card text-muted hover:text-foreground"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Payment list */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {payments.map((p) => {
            const prov = providerLabels[p.provider] || { label: p.provider, color: "text-muted" };
            return (
              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-card/50">
                <div>
                  <p className="text-sm font-medium">{p.user}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium ${prov.color}`}>{prov.label}</span>
                    <span className="text-[10px] text-muted">{p.coinsGranted.toLocaleString()} coins granted</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">{formatCurrency(p.amount, p.currency)}</p>
                  {p.currency !== "AED" && (
                    <p className="text-[10px] text-muted">≈ {formatCurrency(p.amountAed, "AED")}</p>
                  )}
                  <p className="text-[10px] text-muted">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {payments.length === 0 && (
          <p className="text-center text-sm text-muted py-8">No payments found</p>
        )}
      </div>
    </div>
  );
}
