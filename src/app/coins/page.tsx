"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowLeft, CreditCard, Smartphone, Coins, Gift, Zap, Crown, Gem } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";

const coinPackages = [
  { id: "starter", coins: 500, bonusCoins: 0, priceAed: 1800, popular: false, icon: Coins, color: "text-amber-400" },
  { id: "popular", coins: 1200, bonusCoins: 200, priceAed: 3700, popular: true, icon: Zap, color: "text-blue-400" },
  { id: "best-value", coins: 3500, bonusCoins: 500, priceAed: 9200, popular: false, icon: Crown, color: "text-purple-400" },
  { id: "whale", coins: 10000, bonusCoins: 2000, priceAed: 18400, popular: false, icon: Gem, color: "text-red-400" },
];

function formatAed(fils: number): string {
  const aed = fils / 100;
  return `AED ${aed % 1 === 0 ? aed.toFixed(0) : aed.toFixed(2)}`;
}

export default function PurchaseCoinsPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const { coinBalance } = useUser();

  const selected = coinPackages.find((p) => p.id === selectedPackage);

  const handlePurchase = async () => {
    if (!selected) return;
    setLoading(true);

    try {
      const res = await fetch("/api/coins/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected.id }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div>
        <h1 className="text-xl font-bold">Purchase Coins</h1>
        <div className="flex items-center gap-2 mt-1">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-muted">
            Current balance: <span className="text-foreground font-medium">{formatNumber(coinBalance)}</span>
          </span>
        </div>
      </div>

      {/* Coin Packages */}
      <div className="space-y-3">
        {coinPackages.map((pkg) => {
          const totalCoins = pkg.coins + pkg.bonusCoins;
          const isSelected = selectedPackage === pkg.id;
          const IconComponent = pkg.icon;

          return (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={cn(
                "relative w-full rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? "border-red-500 bg-red-500/5"
                  : "border-border bg-card hover:bg-card-hover"
              )}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-red-500 to-amber-500 px-3 py-0.5 text-[10px] font-bold text-white">
                  MOST POPULAR
                </span>
              )}

              <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border", isSelected && "border-red-500/30")}>
                  <IconComponent className={cn("h-6 w-6", pkg.color)} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatNumber(totalCoins)}</span>
                    <Coins className="h-4 w-4 text-amber-400" />
                  </div>
                  {pkg.bonusCoins > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Gift className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">
                        +{formatNumber(pkg.bonusCoins)} bonus coins
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">{formatAed(pkg.priceAed)}</p>
                  <p className="text-[10px] text-muted">
                    {formatAed(Math.round(pkg.priceAed / totalCoins * 100))}/100 coins
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Promo Code */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Promo Code</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 rounded-xl border border-border bg-card py-2.5 px-3 text-sm text-foreground placeholder:text-muted/50 focus:border-red-500 focus:outline-none"
          />
          <Button variant="secondary" size="md">Apply</Button>
        </div>
      </div>

      {/* Payment Info */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted" />
          <span className="text-xs text-muted">Accepted payment methods</span>
        </div>
        <div className="flex gap-2">
          {["Visa", "Mastercard", "AMEX", "Google Pay", "Apple Pay"].map((method) => (
            <span
              key={method}
              className="rounded-md bg-background border border-border px-2 py-1 text-[10px] text-muted"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Summary & Purchase Button */}
      {selected && (
        <div className="rounded-xl bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Coins</span>
            <span className="font-medium">{formatNumber(selected.coins + selected.bonusCoins)}</span>
          </div>
          {selected.bonusCoins > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Includes bonus</span>
              <span className="text-green-400 font-medium">+{formatNumber(selected.bonusCoins)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-border/50 pt-2">
            <span className="font-medium">Total</span>
            <span className="text-lg font-bold">{formatAed(selected.priceAed)}</span>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={!selected || loading}
        onClick={handlePurchase}
      >
        {loading ? "Redirecting to payment..." : selected ? `Pay ${formatAed(selected.priceAed)}` : "Select a package"}
      </Button>

      <p className="text-center text-[10px] text-muted">
        Payments are processed securely by Stripe. All prices in AED.
      </p>
    </div>
  );
}
