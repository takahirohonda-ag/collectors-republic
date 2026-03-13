"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import Link from "next/link";

export default function CoinConfirmPage() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/coins/complete");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <Link href="/coins" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-xl font-bold">Payment Information</h1>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted">Order</span>
          <span className="text-sm font-bold">1,000 Coins — $85</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Name on Card</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground placeholder:text-muted/50 focus:border-red-500 focus:outline-none" required />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" maxLength={19} className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:border-red-500 focus:outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted">Expiry</label>
            <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground placeholder:text-muted/50 focus:border-red-500 focus:outline-none" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted">CVC</label>
            <input type="text" value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" maxLength={4} className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground placeholder:text-muted/50 focus:border-red-500 focus:outline-none" required />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted">
          <Lock className="h-3 w-3" />
          Secured by Stripe. Your payment info is encrypted.
        </div>

        <Button type="submit" size="lg" className="w-full">Pay $85</Button>
      </form>
    </div>
  );
}
