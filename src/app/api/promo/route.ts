import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

/**
 * Promo code definitions.
 * Each code can only be redeemed once per user.
 */
const PROMO_CODES: Record<string, { coinsGranted: number; description: string }> = {
  WELCOME100: { coinsGranted: 100, description: "Welcome bonus" },
  DUBAI2026: { coinsGranted: 200, description: "Dubai 2026 promo" },
};

/**
 * POST /api/promo
 * Body: { code: string; userId?: string }
 * Validates a promo code, credits coins, and records a CoinTransaction.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId: bodyUserId } = body as { code?: string; userId?: string };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const promo = PROMO_CODES[normalizedCode];

    if (!promo) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      // Mock fallback — no DB available
      return NextResponse.json({
        success: true,
        coinsGranted: promo.coinsGranted,
        newBalance: 12500 + promo.coinsGranted,
        isMock: true,
      });
    }

    // Resolve userId: prefer body param, fall back to authenticated session
    let supabaseId = bodyUserId;
    if (!supabaseId) {
      const authUser = await getCurrentUser();
      supabaseId = authUser?.id;
    }

    if (!supabaseId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Find the DB user
    const user = await prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if this code was already redeemed by this user
    const alreadyRedeemed = await prisma.coinTransaction.findFirst({
      where: {
        userId: user.id,
        type: "bonus",
        description: { contains: normalizedCode },
      },
    });

    if (alreadyRedeemed) {
      return NextResponse.json(
        { error: "Promo code already redeemed" },
        { status: 409 }
      );
    }

    const newBalance = user.coinBalance + promo.coinsGranted;

    // Credit coins and record transaction atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { coinBalance: newBalance },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: user.id,
          type: "bonus",
          amount: promo.coinsGranted,
          balanceAfter: newBalance,
          description: `Promo code redeemed: ${normalizedCode} — ${promo.description}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      coinsGranted: promo.coinsGranted,
      newBalance,
    });
  } catch (error) {
    console.error("Promo route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
