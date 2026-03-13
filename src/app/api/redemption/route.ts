import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { requestRedemption } from "@/lib/nft/redemption";

/**
 * GET /api/redemption
 * Get user's redemption requests.
 *
 * POST /api/redemption
 * Request redemption (NFT → physical card).
 * Body: { nftId: string, shippingAddress: {...} }
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    const prisma = getPrisma();
    if (!prisma || !authUser) {
      return NextResponse.json({ redemptions: [] });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });
    if (!user) {
      return NextResponse.json({ redemptions: [] });
    }

    const redemptions = await prisma.redemptionRequest.findMany({
      where: { userId: user.id },
      include: {
        nft: { include: { card: true } },
        shippingOrder: true,
      },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json({ redemptions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch redemptions" }, { status: 500 });
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

    const { nftId, shippingAddress } = await request.json();
    if (!nftId || !shippingAddress) {
      return NextResponse.json({ error: "nftId and shippingAddress required" }, { status: 400 });
    }

    const result = await requestRedemption({
      nftId,
      userId: user.id,
      shippingAddress,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request redemption";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
