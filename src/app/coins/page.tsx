"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowLeft, CreditCard, Smartphone, Coins } from "lucide-react";
import Link from "next/link";

const coinPackages = [
  { coins: 100, price: 10, popular: false },
  { coins: 500, price: 45, popular: false },
  { coins: 1000, price: 85, popular: true },
  { coins: 2500, price: 200, popular: false },
  { coins: 5000, price: 375, popular: false },
  { coins: 10000, price: 700, popular: false },
];

type PaymentMethod = "card" | "google_pay" | "apple_pay";

export default function PurchaseCoinsPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [promoCode, setPromoCode] = useState("");

  const selected = selectedPackage !== null ? coinPackages[selectedPackage] : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-xl font-bold">Purchase Coins</h1>

      {/* Coin Packages */}
      <div className="grid grid-cols-3 gap-2">
        {coinPackages.map((pkg, i) => (
          <button
            key={i}
            onClick={() => setSelectedPackage(i)}
            className={cn(
              "relative rounded-xl border p-3 text-center transition-all",
              selectedPackage === i
                ? "border-red-500 bg-red-500/5"
                : "border-border bg-card hover:bg-card-hover"
            )}
          >
            {pkg.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">
                POPULAR
              </span>
            )}
            <Coins className="mx-auto h-5 w-5 text-amber-400 mb-1" />
            <p className="text-sm font-bold">{formatNumber(pkg.coins)}</p>
            <p className="text-xs text-muted">${pkg.price}</p>
          </button>
        ))}
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Payment Method</h2>
        <div className="space-y-2">
          {[
            { id: "card" as const, label: "Credit Card", icon: CreditCard, sub: "Visa, Mastercard, AMEX" },
            { id: "google_pay" as const, label: "Google Pay", icon: Smartphone, sub: "" },
            { id: "apple_pay" as const, label: "Apple Pay", icon: Smartphone, sub: "" },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 transition-all",
                paymentMethod === method.id
                  ? "border-red-500 bg-red-500/5"
                  : "border-border bg-card hover:bg-card-hover"
              )}
            >
              <method.icon className="h-5 w-5 text-muted" />
              <div className="text-left">
                <p className="text-sm font-medium">{method.label}</p>
                {method.sub && <p className="text-[10px] text-muted">{method.sub}</p>}
              </div>
              <div className={cn(
                "ml-auto h-4 w-4 rounded-full border-2",
                paymentMethod === method.id ? "border-red-500 bg-red-500" : "border-border"
              )} />
            </button>
          ))}
        </div>
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

      {/* Summary */}
      {selected && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Coins</span>
            <span className="font-medium">{formatNumber(selected.coins)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Price</span>
            <span className="font-bold">${selected.price}</span>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={selectedPackage === null}
        onClick={() => router.push("/coins/confirm")}
      >
        Continue to Payment
      </Button>
    </div>
  );
}
