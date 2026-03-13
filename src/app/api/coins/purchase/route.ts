import { NextRequest, NextResponse } from "next/server";
import { stripe, COIN_PACKAGES } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const { packageId } = await req.json();

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const authUser = await getCurrentUser();
    const totalCoins = pkg.coins + pkg.bonusCoins;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "aed",
      line_items: [
        {
          price_data: {
            currency: "aed",
            product_data: {
              name: `${totalCoins.toLocaleString()} Coins`,
              description: pkg.bonusCoins > 0
                ? `${pkg.coins.toLocaleString()} coins + ${pkg.bonusCoins.toLocaleString()} bonus`
                : `${pkg.coins.toLocaleString()} coins`,
            },
            unit_amount: pkg.priceAed,
          },
          quantity: 1,
        },
      ],
      metadata: {
        packageId: pkg.id,
        coins: String(pkg.coins),
        bonusCoins: String(pkg.bonusCoins),
        userId: authUser?.id || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/coins/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coins`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
