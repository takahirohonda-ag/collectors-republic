import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

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
    const { packageId, coins, bonusCoins, userId } = session.metadata || {};

    if (!packageId || !coins) {
      console.error("Missing metadata in checkout session");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const totalCoins = Number(coins) + Number(bonusCoins || 0);

    const prisma = getPrisma();
    if (prisma && userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { supabaseId: userId },
        });

        if (user) {
          const newBalance = user.coinBalance + totalCoins;

          await prisma.$transaction([
            prisma.user.update({
              where: { id: user.id },
              data: { coinBalance: newBalance },
            }),
            prisma.coinTransaction.create({
              data: {
                userId: user.id,
                type: "purchase",
                amount: totalCoins,
                balanceAfter: newBalance,
                stripePaymentId: session.payment_intent as string,
                description: `Purchased ${totalCoins} coins (package: ${packageId})`,
              },
            }),
          ]);

          console.log(`Coins credited: ${totalCoins} to user ${user.id}`);
        } else {
          console.error(`User not found for supabaseId: ${userId}`);
        }
      } catch (dbError) {
        console.error("DB error in webhook:", dbError);
        // Log for manual reconciliation
      }
    } else {
      console.log(`Payment received (no DB): ${totalCoins} coins for package ${packageId}`);
    }
  }

  return NextResponse.json({ received: true });
}
