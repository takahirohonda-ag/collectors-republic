import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { createListing } from "@/lib/nft/marketplace";

/**
 * POST /api/marketplace/list
 * List an NFT for sale on the marketplace.
 * Body: { nftId: string, priceCoins: number }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    const prisma = getPrisma();
    if (!prisma || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const { nftId, priceCoins } = await request.json();
    if (!nftId || !priceCoins || priceCoins <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await createListing({
      nftId,
      sellerId: user.id,
      priceCoins,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
