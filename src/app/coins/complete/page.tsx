"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Coins, PartyPopper, AlertCircle, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useUser } from "@/context/user-context";
import { formatAed } from "@/lib/stripe";

interface SessionDetails {
  coins: number;
  bonusCoins: number;
  totalCoins: number;
  packageName: string;
  amountAed: number;
}

function CompletionContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { coinBalance, refreshBalance } = useUser();

  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. Please return to the coins page.");
      setLoading(false);
      return;
    }

    async function fetchSession() {
      try {
        const res = await fetch(`/api/coins/verify-session?session_id=${encodeURIComponent(sessionId!)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to verify purchase");
        }
        const data: SessionDetails = await res.json();
        setDetails(data);
        // Refresh the user balance now that coins have been credited
        await refreshBalance();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId, refreshBalance]);

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
          <p className="text-sm text-muted">Verifying your purchase…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
        <div className="w-full text-center space-y-6">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted">{error}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/coins" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">Back to Coins</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button size="lg" className="w-full">Back to Gacha</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full text-center space-y-6">
        {/* Success icon */}
        <div className="relative mx-auto w-fit">
          <CheckCircle className="h-16 w-16 text-green-400" />
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 animate-bounce">
            <PartyPopper className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Purchase Complete!</h1>
          {details && (
            <p className="text-sm text-muted">
              {details.packageName} · {formatAed(details.amountAed)}
            </p>
          )}
        </div>

        {/* Purchase breakdown */}
        {details && (
          <div className="rounded-xl bg-card border border-border p-5 space-y-4 text-left">
            <h2 className="text-sm font-semibold text-center text-muted uppercase tracking-wide">
              What you got
            </h2>

            <div className="space-y-2">
              {/* Base coins */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Coins purchased</span>
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold text-amber-400">{formatNumber(details.coins)}</span>
                </div>
              </div>

              {/* Bonus coins */}
              {details.bonusCoins > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Bonus coins</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-green-400" />
                    <span className="font-semibold text-green-400">+{formatNumber(details.bonusCoins)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Total added</span>
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="text-lg font-bold text-amber-400">{formatNumber(details.totalCoins)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New balance */}
        <div className="rounded-xl bg-card border border-border p-4 space-y-1">
          <p className="text-xs text-muted">Your new balance</p>
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-2xl font-bold text-amber-400">{formatNumber(coinBalance)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button size="lg" className="w-full">Back to Gacha</Button>
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
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
        </div>
      }
    >
      <CompletionContent />
    </Suspense>
  );
}
