import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

/**
 * GET /api/nft/mint-status?nftId=xxx
 * Check the minting status of an NFT.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    const prisma = getPrisma();
    if (!prisma || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nftId = searchParams.get("nftId");
    if (!nftId) {
      return NextResponse.json({ error: "nftId required" }, { status: 400 });
    }

    const nft = await prisma.nft.findUnique({
      where: { id: nftId },
      select: {
        id: true,
        tokenId: true,
        status: true,
        mintTxHash: true,
        mintedAt: true,
        metadataUri: true,
        contractAddress: true,
        chainId: true,
      },
    });

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    return NextResponse.json(nft);
  } catch {
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
