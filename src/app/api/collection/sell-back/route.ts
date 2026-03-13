import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

const SELL_BACK_RATE = 0.8;

/**
 * POST /api/collection/sell-back
 * Sells cards from user's collection for 80% of market value.
 * Body: { collectionItemIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { collectionItemIds } = await request.json();

    if (!collectionItemIds || !Array.isArray(collectionItemIds) || collectionItemIds.length === 0) {
      return NextResponse.json({ error: "collectionItemIds array is required" }, { status: 400 });
    }

    const authUser = await getCurrentUser();
    const prisma = getPrisma();

    if (!prisma || !authUser) {
      // Mock mode
      return NextResponse.json({
        success: true,
        sellBackRate: SELL_BACK_RATE,
        coinsReceived: 0,
        message: "Mock mode — connect Supabase DB for real sell-back",
      });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Get items to sell
    const items = await prisma.collection.findMany({
      where: {
        id: { in: collectionItemIds },
        userId: user.id,
        status: "in_collection",
      },
      include: { card: true },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "No valid items to sell" }, { status: 400 });
    }

    const totalCoins = items.reduce(
      (sum: number, item: { card: { marketValue: number } }) =>
        sum + Math.floor(item.card.marketValue * SELL_BACK_RATE),
      0
    );
    const newBalance = user.coinBalance + totalCoins;

    // Transaction: update items + credit coins + record transaction
    await prisma.$transaction([
      ...items.map((item: { id: string }) =>
        prisma.collection.update({
          where: { id: item.id },
          data: { status: "sold_back" },
        })
      ),
      prisma.user.update({
        where: { id: user.id },
        data: { coinBalance: newBalance },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: user.id,
          type: "sell_back",
          amount: totalCoins,
          balanceAfter: newBalance,
          description: `Sold back ${items.length} card(s)`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      sellBackRate: SELL_BACK_RATE,
      coinsReceived: totalCoins,
      newBalance,
      itemsSold: items.length,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
