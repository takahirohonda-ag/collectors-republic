import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_CARDS = [
  { id: "c1", name: "Pikachu VMAX", imageUrl: "https://images.pokemontcg.io/swsh4/44_hires.png", rarity: "tier1", marketValue: 4500, seriesId: null, series: "Pokemon", createdAt: "2026-01-01" },
  { id: "c2", name: "Charizard GX", imageUrl: "https://images.pokemontcg.io/sm3/100_hires.png", rarity: "tier2", marketValue: 8500, seriesId: null, series: "Pokemon", createdAt: "2026-01-01" },
  { id: "c3", name: "Rayquaza V Alt Art", imageUrl: "https://images.pokemontcg.io/swsh7/218_hires.png", rarity: "tier3", marketValue: 18000, seriesId: null, series: "Pokemon", createdAt: "2026-01-02" },
  { id: "c4", name: "Umbreon VMAX Alt Art", imageUrl: "https://images.pokemontcg.io/swsh6/215_hires.png", rarity: "tier4", marketValue: 45000, seriesId: null, series: "Pokemon", createdAt: "2026-01-03" },
  { id: "c5", name: "Mewtwo GX", imageUrl: "https://images.pokemontcg.io/sm35/77_hires.png", rarity: "tier1", marketValue: 3500, seriesId: null, series: "Pokemon", createdAt: "2026-01-04" },
  { id: "c6", name: "Monkey D. Luffy OP01-013", imageUrl: "", rarity: "tier4", marketValue: 52000, seriesId: null, series: "One Piece", createdAt: "2026-01-05" },
];

// GET /api/admin/cards?take=20&skip=0&seriesId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const take = parseInt(searchParams.get("take") || "50");
  const skip = parseInt(searchParams.get("skip") || "0");
  const seriesId = searchParams.get("seriesId") || null;

  const prisma = getPrisma();
  if (!prisma) {
    const filtered = seriesId ? MOCK_CARDS.filter((c) => c.seriesId === seriesId) : MOCK_CARDS;
    const paged = filtered.slice(skip, skip + take);
    return NextResponse.json({ cards: paged, total: filtered.length, isDbConnected: false });
  }

  try {
    const where = seriesId ? { seriesId } : {};

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          cardSeries: { select: { id: true, name: true, slug: true } },
          _count: { select: { collections: true } },
        },
      }),
      prisma.card.count({ where }),
    ]);

    const result = cards.map((c: {
      id: string;
      name: string;
      imageUrl: string;
      rarity: string;
      marketValue: number;
      series: string;
      seriesId: string | null;
      createdAt: Date;
      cardSeries: { id: string; name: string; slug: string } | null;
      _count: { collections: number };
    }) => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl,
      rarity: c.rarity,
      marketValue: c.marketValue,
      series: c.cardSeries?.name || c.series,
      seriesId: c.seriesId,
      collectionsCount: c._count.collections,
      createdAt: c.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({ cards: result, total, isDbConnected: true });
  } catch (error) {
    console.error("Admin cards GET error:", error);
    return NextResponse.json({ cards: MOCK_CARDS, total: MOCK_CARDS.length, isDbConnected: false });
  }
}

// POST /api/admin/cards — Create a new card
export async function POST(request: NextRequest) {
  const prisma = getPrisma();
  const body = await request.json();
  const { name, imageUrl, rarity, marketValue, seriesId } = body;

  if (!name || !imageUrl || !rarity || marketValue == null) {
    return NextResponse.json({ error: "name, imageUrl, rarity, and marketValue are required" }, { status: 400 });
  }

  if (!prisma) {
    const mockCard = {
      id: `mock-${Date.now()}`,
      name,
      imageUrl,
      rarity,
      marketValue,
      seriesId: seriesId || null,
      series: "Unknown",
      createdAt: new Date().toISOString().split("T")[0],
    };
    return NextResponse.json({ card: mockCard, isDbConnected: false });
  }

  try {
    const card = await prisma.card.create({
      data: {
        name,
        imageUrl,
        rarity,
        marketValue,
        seriesId: seriesId || null,
        series: "Unknown",
      },
      include: { cardSeries: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      card: {
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        rarity: card.rarity,
        marketValue: card.marketValue,
        series: (card as { cardSeries?: { name: string } | null }).cardSeries?.name || card.series,
        seriesId: card.seriesId,
        createdAt: card.createdAt.toISOString().split("T")[0],
      },
      isDbConnected: true,
    });
  } catch (error) {
    console.error("Admin cards POST error:", error);
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}

// PATCH /api/admin/cards — Update a card
export async function PATCH(request: NextRequest) {
  const prisma = getPrisma();
  const body = await request.json();
  const { id, name, imageUrl, rarity, marketValue, seriesId } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({ success: true, message: "Mock mode — no DB update" });
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (rarity !== undefined) updateData.rarity = rarity;
    if (marketValue !== undefined) updateData.marketValue = marketValue;
    if (seriesId !== undefined) updateData.seriesId = seriesId || null;

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
      include: { cardSeries: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      card: {
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        rarity: card.rarity,
        marketValue: card.marketValue,
        series: (card as { cardSeries?: { name: string } | null }).cardSeries?.name || card.series,
        seriesId: card.seriesId,
        createdAt: card.createdAt.toISOString().split("T")[0],
      },
      isDbConnected: true,
    });
  } catch (error) {
    console.error("Admin cards PATCH error:", error);
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
  }
}

// DELETE /api/admin/cards — Delete a card (only if not in any collection)
export async function DELETE(request: NextRequest) {
  const prisma = getPrisma();
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({ success: true, message: "Mock mode — no DB delete" });
  }

  try {
    const collectionsCount = await prisma.collection.count({ where: { cardId: id } });
    if (collectionsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: card is in ${collectionsCount} user collection(s)` },
        { status: 409 }
      );
    }

    await prisma.card.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin cards DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
