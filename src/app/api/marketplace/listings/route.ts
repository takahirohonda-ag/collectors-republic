import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

/**
 * GET /api/marketplace/listings
 * List active marketplace listings with pagination and filters.
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ listings: [], total: 0, isDbConnected: false });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const series = searchParams.get("series");
    const rarity = searchParams.get("rarity");
    const sortBy = searchParams.get("sort") || "newest"; // newest, price_asc, price_desc
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: "active" };
    if (series || rarity) {
      where.nft = {
        card: {
          ...(series ? { series } : {}),
          ...(rarity ? { rarity } : {}),
        },
      };
    }

    const orderBy =
      sortBy === "price_asc"
        ? { priceCoins: "asc" as const }
        : sortBy === "price_desc"
          ? { priceCoins: "desc" as const }
          : { listedAt: "desc" as const };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          nft: {
            include: {
              card: true,
              physicalCard: { select: { gradeProvider: true, gradeScore: true } },
            },
          },
          seller: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
