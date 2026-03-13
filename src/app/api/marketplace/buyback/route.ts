import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { instantBuyback } from "@/lib/nft/marketplace";

/**
 * POST /api/marketplace/buyback
 * Instant buyback: sell NFT to platform at 90% FMV.
 * Body: { nftId: string }
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

    const { nftId } = await request.json();
    if (!nftId) {
      return NextResponse.json({ error: "nftId required" }, { status: 400 });
    }

    const result = await instantBuyback({ nftId, userId: user.id });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process buyback";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
