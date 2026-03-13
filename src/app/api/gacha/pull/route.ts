import { NextRequest, NextResponse } from "next/server";
import { gachaPacks } from "@/data/mock";
import type { CardRarity, Card } from "@/types";

/**
 * Server-side gacha pull — determines rarity via weighted random,
 * then picks a random card of that rarity from the pack.
 * This prevents client-side manipulation of pull results.
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

    // Pick a random card of the selected rarity from the pack
    const cardsOfRarity = pack.cardsInPack.filter((c) => c.rarity === selectedRarity);
    if (cardsOfRarity.length === 0) {
      // Fallback: pick any card from the pack
      const fallbackCard = pack.cardsInPack[Math.floor(Math.random() * pack.cardsInPack.length)];
      return NextResponse.json({ card: fallbackCard, rarity: fallbackCard.rarity });
    }

    const selectedCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];

    // TODO: When DB is connected:
    // 1. Verify user has enough coins
    // 2. Deduct coins from balance
    // 3. Add card to user's collection
    // 4. Record in pull_history
    // 5. Record coin transaction

    return NextResponse.json({
      card: selectedCard,
      rarity: selectedRarity,
      packId: pack.id,
      pullId: `pull-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
