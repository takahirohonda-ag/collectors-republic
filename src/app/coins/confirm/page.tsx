"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is no longer needed — Stripe Checkout handles the payment form.
// Redirect to /coins if someone lands here directly.
export default function CoinConfirmPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/coins"); }, [router]);
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
      <p className="text-muted text-sm">Redirecting...</p>
    </div>
  );
}
