import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

/**
 * GET /api/collection — returns user's card collection from DB.
 * Falls back to empty array if DB is not connected.
 */
export async function GET() {
  const authUser = await getCurrentUser();
  const prisma = getPrisma();

  if (!prisma || !authUser) {
    return NextResponse.json({ collection: [], isDbConnected: false });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ collection: [], isDbConnected: true });
    }

    const items = await prisma.collection.findMany({
      where: { userId: user.id },
      include: { card: true },
      orderBy: { acquiredAt: "desc" },
    });

    const collection = items.map((item: { id: string; card: { id: string; name: string; imageUrl: string; rarity: string; marketValue: number; series: string }; acquiredAt: Date; status: string; sellBackValue: number }) => ({
      id: item.id,
      card: {
        id: item.card.id,
        name: item.card.name,
        imageUrl: item.card.imageUrl,
        rarity: item.card.rarity,
        marketValue: item.card.marketValue,
        series: item.card.series,
      },
      acquiredAt: item.acquiredAt,
      status: item.status,
      sellBackValue: item.sellBackValue,
    }));

    return NextResponse.json({ collection, isDbConnected: true });
  } catch (error) {
    console.error("Collection API error:", error);
    return NextResponse.json({ collection: [], isDbConnected: false });
  }
}
