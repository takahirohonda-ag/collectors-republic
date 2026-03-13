import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { packageId, coins, bonusCoins } = session.metadata || {};

    if (!packageId || !coins) {
      console.error("Missing metadata in checkout session");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const totalCoins = Number(coins) + Number(bonusCoins || 0);

    // TODO: Once Prisma + Auth are connected:
    // 1. Get userId from session metadata
    // 2. Update user.coinBalance += totalCoins
    // 3. Insert coin_transaction record

    console.log(`Payment successful: ${totalCoins} coins for package ${packageId}`);
  }

  return NextResponse.json({ received: true });
}
