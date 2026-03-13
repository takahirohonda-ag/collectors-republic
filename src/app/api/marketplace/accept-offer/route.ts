import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { acceptOffer } from "@/lib/nft/marketplace";

/**
 * POST /api/marketplace/accept-offer
 * Accept a pending offer on your NFT.
 * Body: { offerId: string }
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

    const { offerId } = await request.json();
    if (!offerId) {
      return NextResponse.json({ error: "offerId required" }, { status: 400 });
    }

    const result = await acceptOffer({ offerId, sellerId: user.id });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept offer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
