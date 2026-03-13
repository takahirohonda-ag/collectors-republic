"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Coins, PartyPopper } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useUser } from "@/context/user-context";

function CompletionContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { coinBalance } = useUser();

  // TODO: Fetch actual session details from Stripe via API
  // For now, show a generic success message

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full text-center space-y-6">
        <div className="relative mx-auto w-fit">
          <CheckCircle className="h-16 w-16 text-green-400" />
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 animate-bounce">
            <PartyPopper className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Purchase Complete!</h1>
          <p className="text-sm text-muted">
            Coins have been added to your balance
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-2xl font-bold text-amber-400">{formatNumber(coinBalance)}</span>
          </div>
          <p className="text-xs text-muted">Current Balance</p>
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

export default function CoinCompletePage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
        <p className="text-muted">Loading...</p>
      </div>
    }>
      <CompletionContent />
    </Suspense>
  );
}
