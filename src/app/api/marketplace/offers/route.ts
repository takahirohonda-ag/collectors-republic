import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { createOffer } from "@/lib/nft/marketplace";

/**
 * GET /api/marketplace/offers?nftId=xxx
 * Get offers for an NFT.
 *
 * POST /api/marketplace/offers
 * Create a new offer.
 * Body: { nftId: string, priceCoins: number, expiresInHours?: number }
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ offers: [] });
    }

    const { searchParams } = new URL(request.url);
    const nftId = searchParams.get("nftId");
    if (!nftId) {
      return NextResponse.json({ error: "nftId required" }, { status: 400 });
    }

    const offers = await prisma.offer.findMany({
      where: { nftId, status: "pending" },
      include: {
        bidder: { select: { id: true, username: true, avatarUrl: true } },
      },
      orderBy: { priceCoins: "desc" },
    });

    return NextResponse.json({ offers });
  } catch {
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

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

    const { nftId, priceCoins, expiresInHours } = await request.json();
    if (!nftId || !priceCoins || priceCoins <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await createOffer({
      nftId,
      bidderId: user.id,
      priceCoins,
      expiresInHours,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create offer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
