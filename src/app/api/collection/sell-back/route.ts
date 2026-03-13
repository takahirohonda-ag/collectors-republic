import { NextRequest, NextResponse } from "next/server";

const SELL_BACK_RATE = 0.8; // 80% of market value

/**
 * POST /api/collection/sell-back
 * Sells a card back from the user's collection for 80% of its coin value.
 */
export async function POST(request: NextRequest) {
  try {
    const { collectionItemId } = await request.json();

    if (!collectionItemId) {
      return NextResponse.json({ error: "collectionItemId is required" }, { status: 400 });
    }

    // TODO: When DB is connected:
    // 1. Verify item belongs to user
    // 2. Verify item status is "in_collection"
    // 3. Calculate sell-back value (marketValue * SELL_BACK_RATE)
    // 4. Add coins to user balance
    // 5. Update item status to "sold_back"
    // 6. Record coin transaction

    return NextResponse.json({
      success: true,
      sellBackRate: SELL_BACK_RATE,
      message: "Connect Supabase to enable real sell-back",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
