import { NextRequest, NextResponse } from "next/server";
import { gachaPacks } from "@/data/mock";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import type { CardRarity } from "@/types";
import { mintCardNft } from "@/lib/nft/mint";

/**
 * POST /api/gacha/pull
 * Server-side gacha pull with DB integration + NFT minting.
 * 1. Verify balance & deduct coins
 * 2. Select card via probability engine
 * 3. Add to collection
 * 4. Mint NFT (async, non-blocking)
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
        const sellBackValue = Math.floor(selectedCard.marketValue * 0.9); // 90% FMV (Courtyard-style)

        const [, collection] = await prisma.$transaction([
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
              packId: pack.id,
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

        // Mint NFT in the background (don't block the response)
        let nftMintPromise: { nftId?: string } = {};
        try {
          // Fire-and-forget: mint NFT asynchronously
          const mintPromise = mintCardNft({
            userId: user.id,
            cardId: dbCard.id,
            cardName: dbCard.name,
            cardSeries: dbCard.series,
            cardRarity: dbCard.rarity,
            cardImageUrl: dbCard.imageUrl,
            marketValue: dbCard.marketValue,
          }).then(async (result) => {
            // Link NFT to collection item
            await prisma.collection.update({
              where: { id: collection.id },
              data: { nftId: result.nftId },
            });
            return result;
          }).catch((err) => {
            console.error("NFT mint failed (will retry):", err);
            return null;
          });

          // Wait briefly for fast mints, but don't block for long
          const raceResult = await Promise.race([
            mintPromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
          ]);
          if (raceResult) {
            nftMintPromise = { nftId: raceResult.nftId };
          }
        } catch {
          // NFT minting failure doesn't block gacha result
        }

        return NextResponse.json({
          card: selectedCard,
          rarity: selectedRarity,
          packId: pack.id,
          pullId,
          newBalance,
          collectionId: collection.id,
          nft: nftMintPromise.nftId
            ? { nftId: nftMintPromise.nftId, status: "minted" }
            : { status: "minting" }, // Client can poll /api/nft/mint-status
        });
      } catch (dbError) {
        console.error("DB pull error, falling back to mock:", dbError);
      }
    }

    // Mock mode (no DB)
    return NextResponse.json({
      card: selectedCard,
      rarity: selectedRarity,
      packId: pack.id,
      pullId,
      nft: { status: "mock" },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
