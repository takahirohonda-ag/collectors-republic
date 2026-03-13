"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

const mockSellBackCards = [
  { id: "1", name: "Pikachu VMAX", marketValue: 45, sellBackValue: 36 },
  { id: "2", name: "Charizard GX", marketValue: 85, sellBackValue: 68 },
];

export default function SellBackPage() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  const totalMarket = mockSellBackCards.reduce((s, c) => s + c.marketValue, 0);
  const totalSellBack = mockSellBackCards.reduce((s, c) => s + c.sellBackValue, 0);

  if (confirmed) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
        <div className="w-full text-center space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
          <h1 className="text-2xl font-bold">Sell Back Complete!</h1>
          <p className="text-sm text-muted">
            <span className="text-amber-400 font-bold">{formatCurrency(totalSellBack)}</span> in coins have been added to your balance
          </p>
          <div className="flex gap-3">
            <Link href="/" className="flex-1"><Button size="lg" className="w-full">Open More Packs</Button></Link>
            <Link href="/collection" className="flex-1"><Button variant="secondary" size="lg" className="w-full">Collection</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <Link href="/collection" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Collection
      </Link>

      <h1 className="text-xl font-bold">Sell Back Confirmation</h1>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-200">
          Cards sold back will be permanently removed from your collection. You&apos;ll receive 80% of market value in coins.
        </p>
      </div>

      <div className="space-y-2">
        {mockSellBackCards.map((card) => (
          <div key={card.id} className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">🃏</span>
              <div>
                <p className="text-sm font-medium">{card.name}</p>
                <p className="text-xs text-muted">Market: {formatCurrency(card.marketValue)}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-green-400">{formatCurrency(card.sellBackValue)}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Market Value</span>
          <span>{formatCurrency(totalMarket)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Sell Back Rate</span>
          <span>80%</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between text-sm">
          <span className="font-medium">You Receive</span>
          <span className="font-bold text-green-400">{formatCurrency(totalSellBack)} coins</span>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={() => setConfirmed(true)}>
        Confirm Sell Back
      </Button>
    </div>
  );
}
