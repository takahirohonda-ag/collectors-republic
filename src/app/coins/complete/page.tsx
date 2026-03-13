"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Coins } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function CoinCompletePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full text-center space-y-6">
        <div className="relative mx-auto w-fit">
          <CheckCircle className="h-16 w-16 text-green-400" />
          <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
            <Coins className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Purchase Complete!</h1>
          <p className="text-sm text-muted">
            <span className="text-amber-400 font-bold">{formatNumber(1000)}</span> coins have been added to your balance
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Amount Paid</span>
            <span className="font-medium">$85.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Coins Added</span>
            <span className="font-bold text-amber-400">1,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">New Balance</span>
            <span className="font-bold">{formatNumber(13500)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button size="lg" className="w-full">Open Packs</Button>
          </Link>
          <Link href="/coins" className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">Buy More</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
