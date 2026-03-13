import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_PACKS = [
  {
    id: "p1",
    name: "Pokemon Basic Pack",
    tier: "basic",
    price: 100,
    expectedValue: 50,
    description: "Entry-level pack with common cards",
    category: "Pokemon",
    seriesId: null,
    active: true,
    cardCount: 8,
    pullCount: 3245,
    createdAt: "2026-01-01",
    probabilities: [
      { id: "pb1", rarity: "tier1", label: "Common", percentage: 70, valueRangeMin: 10, valueRangeMax: 50, color: "#22c55e" },
      { id: "pb2", rarity: "tier2", label: "Uncommon", percentage: 20, valueRangeMin: 50, valueRangeMax: 150, color: "#3b82f6" },
      { id: "pb3", rarity: "tier3", label: "Rare", percentage: 8, valueRangeMin: 150, valueRangeMax: 500, color: "#a855f7" },
      { id: "pb4", rarity: "tier4", label: "Ultra Rare", percentage: 2, valueRangeMin: 500, valueRangeMax: 5000, color: "#f59e0b" },
    ],
  },
  {
    id: "p2",
    name: "Pokemon Elite Pack",
    tier: "elite",
    price: 500,
    expectedValue: 280,
    description: "Enhanced pack with improved rare odds",
    category: "Pokemon",
    seriesId: null,
    active: true,
    cardCount: 12,
    pullCount: 1021,
    createdAt: "2026-01-02",
    probabilities: [
      { id: "pe1", rarity: "tier1", label: "Common", percentage: 50, valueRangeMin: 10, valueRangeMax: 50, color: "#22c55e" },
      { id: "pe2", rarity: "tier2", label: "Uncommon", percentage: 30, valueRangeMin: 50, valueRangeMax: 150, color: "#3b82f6" },
      { id: "pe3", rarity: "tier3", label: "Rare", percentage: 15, valueRangeMin: 150, valueRangeMax: 500, color: "#a855f7" },
      { id: "pe4", rarity: "tier4", label: "Ultra Rare", percentage: 5, valueRangeMin: 500, valueRangeMax: 5000, color: "#f59e0b" },
    ],
  },
  {
    id: "p3",
    name: "Pokemon Legendary Pack",
    tier: "legendary",
    price: 2000,
    expectedValue: 1200,
    description: "Premium pack for serious collectors",
    category: "Pokemon",
    seriesId: null,
    active: true,
    cardCount: 20,
    pullCount: 312,
    createdAt: "2026-01-03",
    probabilities: [
      { id: "pl1", rarity: "tier1", label: "Common", percentage: 25, valueRangeMin: 10, valueRangeMax: 50, color: "#22c55e" },
      { id: "pl2", rarity: "tier2", label: "Uncommon", percentage: 35, valueRangeMin: 50, valueRangeMax: 150, color: "#3b82f6" },
      { id: "pl3", rarity: "tier3", label: "Rare", percentage: 25, valueRangeMin: 150, valueRangeMax: 500, color: "#a855f7" },
      { id: "pl4", rarity: "tier4", label: "Ultra Rare", percentage: 15, valueRangeMin: 500, valueRangeMax: 5000, color: "#f59e0b" },
    ],
  },
];

// GET /api/admin/packs
export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ packs: MOCK_PACKS, isDbConnected: false });
  }

  try {
    const packs = await prisma.gachaPack.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        probabilities: true,
        _count: { select: { packCards: true, pullHistory: true } },
        cardSeries: { select: { id: true, name: true } },
      },
    });

    const result = packs.map((p: {
      id: string;
      name: string;
      tier: string;
      price: number;
      expectedValue: number;
      description: string;
      category: string;
      seriesId: string | null;
      active: boolean;
      createdAt: Date;
      cardSeries: { id: string; name: string } | null;
      probabilities: {
        id: string;
        rarity: string;
        label: string;
        percentage: number;
        valueRangeMin: number;
        valueRangeMax: number;
        color: string;
      }[];
      _count: { packCards: number; pullHistory: number };
    }) => ({
      id: p.id,
      name: p.name,
      tier: p.tier,
      price: p.price,
      expectedValue: p.expectedValue,
      description: p.description,
      category: p.cardSeries?.name || p.category,
      seriesId: p.seriesId,
      active: p.active,
      cardCount: p._count.packCards,
      pullCount: p._count.pullHistory,
      createdAt: p.createdAt.toISOString().split("T")[0],
      probabilities: p.probabilities,
    }));

    return NextResponse.json({ packs: result, isDbConnected: true });
  } catch (error) {
    console.error("Admin packs GET error:", error);
    return NextResponse.json({ packs: MOCK_PACKS, isDbConnected: false });
  }
}

// POST /api/admin/packs — Create a new pack
export async function POST(request: NextRequest) {
  const prisma = getPrisma();
  const body = await request.json();
  const { name, tier, price, expectedValue, description, category, seriesId, probabilities, cardIds } = body;

  if (!name || !tier || price == null || expectedValue == null || !description) {
    return NextResponse.json(
      { error: "name, tier, price, expectedValue, and description are required" },
      { status: 400 }
    );
  }

  if (!prisma) {
    const mockPack = {
      id: `mock-${Date.now()}`,
      name,
      tier,
      price,
      expectedValue,
      description,
      category: category || "Unknown",
      seriesId: seriesId || null,
      active: true,
      cardCount: (cardIds || []).length,
      pullCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      probabilities: probabilities || [],
    };
    return NextResponse.json({ pack: mockPack, isDbConnected: false });
  }

  try {
    const pack = await prisma.gachaPack.create({
      data: {
        name,
        tier,
        price,
        expectedValue,
        description,
        category: category || "Unknown",
        seriesId: seriesId || null,
        probabilities: probabilities && probabilities.length > 0
          ? {
              create: probabilities.map((prob: {
                rarity: string;
                label: string;
                percentage: number;
                valueRangeMin: number;
                valueRangeMax: number;
                color: string;
              }) => ({
                rarity: prob.rarity,
                label: prob.label,
                percentage: prob.percentage,
                valueRangeMin: prob.valueRangeMin,
                valueRangeMax: prob.valueRangeMax,
                color: prob.color,
              })),
            }
          : undefined,
        packCards: cardIds && cardIds.length > 0
          ? {
              create: (cardIds as string[]).map((cardId) => ({ cardId })),
            }
          : undefined,
      },
      include: {
        probabilities: true,
        _count: { select: { packCards: true, pullHistory: true } },
      },
    });

    return NextResponse.json({
      pack: {
        id: pack.id,
        name: pack.name,
        tier: pack.tier,
        price: pack.price,
        expectedValue: pack.expectedValue,
        description: pack.description,
        category: pack.category,
        seriesId: pack.seriesId,
        active: pack.active,
        cardCount: pack._count.packCards,
        pullCount: pack._count.pullHistory,
        createdAt: pack.createdAt.toISOString().split("T")[0],
        probabilities: pack.probabilities,
      },
      isDbConnected: true,
    });
  } catch (error) {
    console.error("Admin packs POST error:", error);
    return NextResponse.json({ error: "Failed to create pack" }, { status: 500 });
  }
}

// PATCH /api/admin/packs — Update a pack
export async function PATCH(request: NextRequest) {
  const prisma = getPrisma();
  const body = await request.json();
  const { id, name, tier, price, expectedValue, description, category, seriesId, active, probabilities, cardIds } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({ success: true, message: "Mock mode — no DB update" });
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (tier !== undefined) updateData.tier = tier;
    if (price !== undefined) updateData.price = price;
    if (expectedValue !== undefined) updateData.expectedValue = expectedValue;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (seriesId !== undefined) updateData.seriesId = seriesId || null;
    if (active !== undefined) updateData.active = active;

    // Replace probabilities if provided
    if (probabilities) {
      updateData.probabilities = {
        deleteMany: {},
        create: probabilities.map((prob: {
          rarity: string;
          label: string;
          percentage: number;
          valueRangeMin: number;
          valueRangeMax: number;
          color: string;
        }) => ({
          rarity: prob.rarity,
          label: prob.label,
          percentage: prob.percentage,
          valueRangeMin: prob.valueRangeMin,
          valueRangeMax: prob.valueRangeMax,
          color: prob.color,
        })),
      };
    }

    // Replace card associations if provided
    if (cardIds) {
      updateData.packCards = {
        deleteMany: {},
        create: (cardIds as string[]).map((cardId) => ({ cardId })),
      };
    }

    const pack = await prisma.gachaPack.update({
      where: { id },
      data: updateData,
      include: {
        probabilities: true,
        _count: { select: { packCards: true, pullHistory: true } },
      },
    });

    return NextResponse.json({
      pack: {
        id: pack.id,
        name: pack.name,
        tier: pack.tier,
        price: pack.price,
        expectedValue: pack.expectedValue,
        description: pack.description,
        category: pack.category,
        seriesId: pack.seriesId,
        active: pack.active,
        cardCount: pack._count.packCards,
        pullCount: pack._count.pullHistory,
        createdAt: pack.createdAt.toISOString().split("T")[0],
        probabilities: pack.probabilities,
      },
      isDbConnected: true,
    });
  } catch (error) {
    console.error("Admin packs PATCH error:", error);
    return NextResponse.json({ error: "Failed to update pack" }, { status: 500 });
  }
}

// DELETE /api/admin/packs — Delete a pack (only if no pull history)
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
    const pullCount = await prisma.pullHistory.count({ where: { packId: id } });
    if (pullCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: pack has ${pullCount} pull history record(s)` },
        { status: 409 }
      );
    }

    await prisma.gachaPack.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin packs DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete pack" }, { status: 500 });
  }
}
