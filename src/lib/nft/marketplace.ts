/**
 * Marketplace logic — listing, buying, offering, instant buyback.
 * All transactions happen off-chain (DB) with on-chain ownership transfer.
 * Courtyard model: platform acts as market maker with FMV instant buyback.
 */

import { getPrisma } from "@/lib/prisma";
import { PLATFORM_FEE_BPS, SELL_BACK_RATE } from "./config";

// ==========================================
// Listing
// ==========================================

export async function createListing(params: {
  nftId: string;
  sellerId: string;
  priceCoins: number;
}): Promise<{ listingId: string }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  // Verify ownership
  const nft = await prisma.nft.findUnique({
    where: { id: params.nftId },
    include: { collection: true },
  });

  if (!nft || nft.ownerId !== params.sellerId) {
    throw new Error("Not the owner of this NFT");
  }
  if (nft.status !== "active") {
    throw new Error(`NFT is not available for listing (status: ${nft.status})`);
  }

  // Create listing and update statuses in transaction
  const [listing] = await prisma.$transaction([
    prisma.listing.create({
      data: {
        nftId: params.nftId,
        sellerId: params.sellerId,
        priceCoins: params.priceCoins,
        status: "active",
      },
    }),
    prisma.nft.update({
      where: { id: params.nftId },
      data: { status: "listed" },
    }),
    // Update collection status if linked
    ...(nft.collection
      ? [
          prisma.collection.update({
            where: { id: nft.collection.id },
            data: { status: "listed" },
          }),
        ]
      : []),
  ]);

  return { listingId: listing.id };
}

export async function cancelListing(params: {
  listingId: string;
  sellerId: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    include: { nft: { include: { collection: true } } },
  });

  if (!listing || listing.sellerId !== params.sellerId) {
    throw new Error("Listing not found or not authorized");
  }
  if (listing.status !== "active") {
    throw new Error("Listing is not active");
  }

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: params.listingId },
      data: { status: "cancelled" },
    }),
    prisma.nft.update({
      where: { id: listing.nftId },
      data: { status: "active" },
    }),
    ...(listing.nft.collection
      ? [
          prisma.collection.update({
            where: { id: listing.nft.collection.id },
            data: { status: "in_collection" },
          }),
        ]
      : []),
  ]);
}

// ==========================================
// Buying
// ==========================================

export async function buyListing(params: {
  listingId: string;
  buyerId: string;
}): Promise<{ success: boolean; newBalance: number }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    include: {
      nft: { include: { collection: true, card: true } },
      seller: true,
    },
  });

  if (!listing || listing.status !== "active") {
    throw new Error("Listing not available");
  }
  if (listing.sellerId === params.buyerId) {
    throw new Error("Cannot buy your own listing");
  }

  const buyer = await prisma.user.findUnique({
    where: { id: params.buyerId },
  });
  if (!buyer || buyer.coinBalance < listing.priceCoins) {
    throw new Error("Insufficient coins");
  }

  // Calculate platform fee
  const platformFee = Math.floor(
    (listing.priceCoins * PLATFORM_FEE_BPS) / 10000
  );
  const sellerReceives = listing.priceCoins - platformFee;
  const buyerNewBalance = buyer.coinBalance - listing.priceCoins;
  const sellerNewBalance = listing.seller.coinBalance + sellerReceives;

  // Execute trade in transaction
  await prisma.$transaction([
    // Update listing
    prisma.listing.update({
      where: { id: params.listingId },
      data: { status: "sold", soldAt: new Date(), buyerId: params.buyerId },
    }),
    // Transfer NFT ownership
    prisma.nft.update({
      where: { id: listing.nftId },
      data: { ownerId: params.buyerId, status: "active" },
    }),
    // Update buyer balance
    prisma.user.update({
      where: { id: params.buyerId },
      data: { coinBalance: buyerNewBalance },
    }),
    // Update seller balance
    prisma.user.update({
      where: { id: listing.sellerId },
      data: { coinBalance: sellerNewBalance },
    }),
    // Buyer transaction record
    prisma.coinTransaction.create({
      data: {
        userId: params.buyerId,
        type: "spend",
        amount: -listing.priceCoins,
        balanceAfter: buyerNewBalance,
        description: `Bought ${listing.nft.card.name} NFT`,
        referenceId: listing.id,
      },
    }),
    // Seller transaction record
    prisma.coinTransaction.create({
      data: {
        userId: listing.sellerId,
        type: "sell_back",
        amount: sellerReceives,
        balanceAfter: sellerNewBalance,
        description: `Sold ${listing.nft.card.name} NFT (${platformFee} fee)`,
        referenceId: listing.id,
      },
    }),
    // Transfer old collection to buyer
    ...(listing.nft.collection
      ? [
          prisma.collection.update({
            where: { id: listing.nft.collection.id },
            data: { userId: params.buyerId, status: "in_collection" },
          }),
        ]
      : []),
    // Record transfer
    prisma.nftTransfer.create({
      data: {
        nftId: listing.nftId,
        fromId: listing.sellerId,
        toId: params.buyerId,
        type: "sale",
        priceCoins: listing.priceCoins,
      },
    }),
    // Record price history
    prisma.priceHistory.create({
      data: {
        cardId: listing.nft.cardId,
        priceCoins: listing.priceCoins,
        priceAed: 0, // TODO: convert from coins
        source: "marketplace",
      },
    }),
    // Reject all pending offers on this NFT
    prisma.offer.updateMany({
      where: { nftId: listing.nftId, status: "pending" },
      data: { status: "rejected" },
    }),
  ]);

  return { success: true, newBalance: buyerNewBalance };
}

// ==========================================
// Instant Buyback (Courtyard-style)
// ==========================================

/**
 * Platform instantly buys back an NFT at SELL_BACK_RATE * FMV.
 * No listing needed — user gets coins immediately.
 */
export async function instantBuyback(params: {
  nftId: string;
  userId: string;
}): Promise<{ coinsReceived: number; newBalance: number }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const nft = await prisma.nft.findUnique({
    where: { id: params.nftId },
    include: { card: true, collection: true },
  });

  if (!nft || nft.ownerId !== params.userId) {
    throw new Error("Not the owner");
  }
  if (nft.status !== "active") {
    throw new Error("NFT not available for buyback");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
  });
  if (!user) throw new Error("User not found");

  // Calculate buyback value: 90% of card market value
  const buybackCoins = Math.floor(nft.card.marketValue * SELL_BACK_RATE);
  const newBalance = user.coinBalance + buybackCoins;

  await prisma.$transaction([
    // Mark NFT as burned (platform takes custody)
    prisma.nft.update({
      where: { id: params.nftId },
      data: { status: "burned", burnedAt: new Date() },
    }),
    // Update collection
    ...(nft.collection
      ? [
          prisma.collection.update({
            where: { id: nft.collection.id },
            data: { status: "sold_back" },
          }),
        ]
      : []),
    // Credit user
    prisma.user.update({
      where: { id: params.userId },
      data: { coinBalance: newBalance },
    }),
    prisma.coinTransaction.create({
      data: {
        userId: params.userId,
        type: "sell_back",
        amount: buybackCoins,
        balanceAfter: newBalance,
        description: `Instant buyback: ${nft.card.name} (${Math.round(SELL_BACK_RATE * 100)}% FMV)`,
        referenceId: params.nftId,
      },
    }),
    prisma.nftTransfer.create({
      data: {
        nftId: params.nftId,
        fromId: params.userId,
        toId: params.userId, // platform takes it, but recorded as self-transfer
        type: "sale",
        priceCoins: buybackCoins,
      },
    }),
    // Cancel any active listings
    prisma.listing.updateMany({
      where: { nftId: params.nftId, status: "active" },
      data: { status: "cancelled" },
    }),
  ]);

  return { coinsReceived: buybackCoins, newBalance };
}

// ==========================================
// Offers
// ==========================================

export async function createOffer(params: {
  nftId: string;
  bidderId: string;
  priceCoins: number;
  expiresInHours?: number;
}): Promise<{ offerId: string }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const nft = await prisma.nft.findUnique({ where: { id: params.nftId } });
  if (!nft) throw new Error("NFT not found");
  if (nft.ownerId === params.bidderId) throw new Error("Cannot offer on own NFT");

  const bidder = await prisma.user.findUnique({ where: { id: params.bidderId } });
  if (!bidder || bidder.coinBalance < params.priceCoins) {
    throw new Error("Insufficient coins");
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (params.expiresInHours || 48));

  const offer = await prisma.offer.create({
    data: {
      nftId: params.nftId,
      bidderId: params.bidderId,
      priceCoins: params.priceCoins,
      expiresAt,
    },
  });

  return { offerId: offer.id };
}

export async function acceptOffer(params: {
  offerId: string;
  sellerId: string;
}): Promise<{ success: boolean }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const offer = await prisma.offer.findUnique({
    where: { id: params.offerId },
    include: {
      nft: { include: { collection: true, card: true } },
      bidder: true,
    },
  });

  if (!offer || offer.status !== "pending") {
    throw new Error("Offer not available");
  }
  if (offer.nft.ownerId !== params.sellerId) {
    throw new Error("Not the NFT owner");
  }
  if (offer.expiresAt < new Date()) {
    throw new Error("Offer expired");
  }
  if (offer.bidder.coinBalance < offer.priceCoins) {
    throw new Error("Bidder has insufficient coins");
  }

  const platformFee = Math.floor(
    (offer.priceCoins * PLATFORM_FEE_BPS) / 10000
  );
  const sellerReceives = offer.priceCoins - platformFee;

  const seller = await prisma.user.findUnique({ where: { id: params.sellerId } });
  if (!seller) throw new Error("Seller not found");

  const buyerNewBalance = offer.bidder.coinBalance - offer.priceCoins;
  const sellerNewBalance = seller.coinBalance + sellerReceives;

  await prisma.$transaction([
    prisma.offer.update({
      where: { id: params.offerId },
      data: { status: "accepted" },
    }),
    prisma.nft.update({
      where: { id: offer.nftId },
      data: { ownerId: offer.bidderId, status: "active" },
    }),
    prisma.user.update({
      where: { id: offer.bidderId },
      data: { coinBalance: buyerNewBalance },
    }),
    prisma.user.update({
      where: { id: params.sellerId },
      data: { coinBalance: sellerNewBalance },
    }),
    prisma.coinTransaction.create({
      data: {
        userId: offer.bidderId,
        type: "spend",
        amount: -offer.priceCoins,
        balanceAfter: buyerNewBalance,
        description: `Bought ${offer.nft.card.name} NFT (offer)`,
        referenceId: offer.id,
      },
    }),
    prisma.coinTransaction.create({
      data: {
        userId: params.sellerId,
        type: "sell_back",
        amount: sellerReceives,
        balanceAfter: sellerNewBalance,
        description: `Sold ${offer.nft.card.name} NFT via offer (${platformFee} fee)`,
        referenceId: offer.id,
      },
    }),
    ...(offer.nft.collection
      ? [
          prisma.collection.update({
            where: { id: offer.nft.collection.id },
            data: { userId: offer.bidderId, status: "in_collection" },
          }),
        ]
      : []),
    prisma.nftTransfer.create({
      data: {
        nftId: offer.nftId,
        fromId: params.sellerId,
        toId: offer.bidderId,
        type: "sale",
        priceCoins: offer.priceCoins,
      },
    }),
    // Cancel other pending offers
    prisma.offer.updateMany({
      where: { nftId: offer.nftId, status: "pending", id: { not: params.offerId } },
      data: { status: "rejected" },
    }),
    // Cancel active listings
    prisma.listing.updateMany({
      where: { nftId: offer.nftId, status: "active" },
      data: { status: "cancelled" },
    }),
  ]);

  return { success: true };
}
