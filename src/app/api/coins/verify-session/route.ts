import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, COIN_PACKAGES } from "@/lib/stripe";

// Use a fresh client per request (handles env vars set after module load)

/**
 * GET /api/coins/verify-session?session_id=xxx
 * Retrieves Stripe checkout session details for the purchase complete page.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    // Mock fallback for development without Stripe
    return NextResponse.json({
      coins: 1200,
      bonusCoins: 200,
      totalCoins: 1400,
      packageName: "Popular Pack",
      amountAed: 3700,
      isMock: true,
    });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json({ error: "Session not found or payment not completed" }, { status: 404 });
    }

    const { packageId, coins, bonusCoins } = session.metadata || {};

    if (!coins) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    const coinsNum = Number(coins);
    const bonusCoinsNum = Number(bonusCoins || 0);
    const totalCoins = coinsNum + bonusCoinsNum;
    const amountAed = session.amount_total || 0;

    // Look up friendly package name
    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    const packageName = pkg
      ? `${totalCoins.toLocaleString()} Coins`
      : `${totalCoins.toLocaleString()} Coins`;

    return NextResponse.json({
      coins: coinsNum,
      bonusCoins: bonusCoinsNum,
      totalCoins,
      packageName,
      amountAed,
    });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}
