import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/nft/wallet";

/**
 * GET /api/nft/wallet
 * Get or create the user's embedded wallet.
 */
export async function GET() {
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

    const { address, isNew } = await getOrCreateWallet(user.id);
    return NextResponse.json({ address, isNew });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get wallet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
