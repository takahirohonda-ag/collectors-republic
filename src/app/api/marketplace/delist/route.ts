import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { cancelListing } from "@/lib/nft/marketplace";

/**
 * POST /api/marketplace/delist
 * Cancel an active listing.
 * Body: { listingId: string }
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

    const { listingId } = await request.json();
    if (!listingId) {
      return NextResponse.json({ error: "listingId required" }, { status: 400 });
    }

    await cancelListing({ listingId, sellerId: user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel listing";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
