import { NextRequest, NextResponse } from "next/server";
import { gachaPacks } from "@/data/mock";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import type { CardRarity } from "@/types";

/**
 * POST /api/gacha/pull
 * Server-side gacha pull with DB integration.
 * When DB is connected: verifies balance, deducts coins, records history.
 * When DB is not connected: returns card result only (mock mode).
 */
export async function POST(request: NextRequest) {
  try {
    const { packId } = await request.json();

    const pack = gachaPacks.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    // Weighted random rarity selection
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity: CardRarity = "tier1";

    for (const prob of pack.probabilities) {
      cumulative += prob.percentage;
      if (roll < cumulative) {
        selectedRarity = prob.rarity;
        break;
      }
    }

    // Pick a random card of the selected rarity
    const cardsOfRarity = pack.cardsInPack.filter((c) => c.rarity === selectedRarity);
    const selectedCard = cardsOfRarity.length > 0
      ? cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)]
      : pack.cardsInPack[Math.floor(Math.random() * pack.cardsInPack.length)];

    const pullId = `pull-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // DB integration (optional)
    const prisma = getPrisma();
    const authUser = await getCurrentUser();

    if (prisma && authUser) {
      try {
        const user = await prisma.user.findUnique({
          where: { supabaseId: authUser.id },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        if (user.coinBalance < pack.price) {
          return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
        }

        // Find or create the card in DB
        let dbCard = await prisma.card.findFirst({
          where: { name: selectedCard.name, series: selectedCard.series },
        });

        if (!dbCard) {
          dbCard = await prisma.card.create({
            data: {
              name: selectedCard.name,
              imageUrl: selectedCard.imageUrl,
              rarity: selectedCard.rarity,
              marketValue: selectedCard.marketValue,
              series: selectedCard.series,
            },
          });
        }

        // Transaction: deduct coins + add to collection + record history
        const newBalance = user.coinBalance - pack.price;
        const sellBackValue = Math.floor(selectedCard.marketValue * 0.8);

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { coinBalance: newBalance },
          }),
          prisma.collection.create({
            data: {
              userId: user.id,
              cardId: dbCard.id,
              sellBackValue,
            },
          }),
          prisma.pullHistory.create({
            data: {
              userId: user.id,
              packId: pack.id, // mock pack ID — will map to DB pack once seeded
              cardId: dbCard.id,
              coinsSpent: pack.price,
            },
          }),
          prisma.coinTransaction.create({
            data: {
              userId: user.id,
              type: "spend",
              amount: -pack.price,
              balanceAfter: newBalance,
              referenceId: pullId,
              description: `Opened ${pack.name}`,
            },
          }),
        ]);

        return NextResponse.json({
          card: selectedCard,
          rarity: selectedRarity,
          packId: pack.id,
          pullId,
          newBalance,
        });
      } catch (dbError) {
        console.error("DB pull error, falling back to mock:", dbError);
        // Fall through to mock response
      }
    }

    // Mock mode (no DB)
    return NextResponse.json({
      card: selectedCard,
      rarity: selectedRarity,
      packId: pack.id,
      pullId,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
