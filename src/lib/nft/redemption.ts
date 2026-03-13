/**
 * Redemption: Convert NFT back to physical card.
 * NFT is burned, physical card is released from vault and shipped.
 */

import { getPrisma } from "@/lib/prisma";
import { redeemNft } from "./blockchain";

/**
 * Request redemption: user wants their physical card shipped to them.
 * Flow: Request → Admin approval → NFT burn → Vault release → Ship
 */
export async function requestRedemption(params: {
  nftId: string;
  userId: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}): Promise<{ redemptionId: string; shippingOrderId: string }> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const nft = await prisma.nft.findUnique({
    where: { id: params.nftId },
    include: { physicalCard: true, card: true },
  });

  if (!nft || nft.ownerId !== params.userId) {
    throw new Error("Not the owner of this NFT");
  }
  if (nft.status !== "active") {
    throw new Error("NFT is not available for redemption");
  }
  if (!nft.physicalCard || nft.physicalCard.vaultStatus !== "in_vault") {
    throw new Error("Physical card not available in vault");
  }

  // Create shipping order + redemption request in transaction
  const [shippingOrder, redemption] = await prisma.$transaction([
    prisma.shippingOrder.create({
      data: {
        userId: params.userId,
        status: "pending",
        addressJson: params.shippingAddress,
        carrier: "fedex", // default carrier
      },
    }),
    prisma.redemptionRequest.create({
      data: {
        nftId: params.nftId,
        userId: params.userId,
        status: "pending",
      },
    }),
    prisma.nft.update({
      where: { id: params.nftId },
      data: { status: "redeemed" },
    }),
    // Cancel any active listings
    prisma.listing.updateMany({
      where: { nftId: params.nftId, status: "active" },
      data: { status: "cancelled" },
    }),
  ]);

  // Link shipping order to redemption
  await prisma.redemptionRequest.update({
    where: { id: redemption.id },
    data: { shippingOrderId: shippingOrder.id },
  });

  return {
    redemptionId: redemption.id,
    shippingOrderId: shippingOrder.id,
  };
}

/**
 * Admin approves redemption: burn NFT on-chain and release from vault.
 */
export async function approveRedemption(redemptionId: string): Promise<{
  txHash: string;
}> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const redemption = await prisma.redemptionRequest.findUnique({
    where: { id: redemptionId },
    include: {
      nft: { include: { physicalCard: true } },
    },
  });

  if (!redemption || redemption.status !== "pending") {
    throw new Error("Redemption not found or not pending");
  }

  // Burn NFT on-chain
  const txHash = await redeemNft(redemption.nft.tokenId);

  // Update DB
  await prisma.$transaction([
    prisma.redemptionRequest.update({
      where: { id: redemptionId },
      data: { status: "approved" },
    }),
    prisma.nft.update({
      where: { id: redemption.nftId },
      data: { status: "burned", burnedAt: new Date() },
    }),
    // Release physical card from vault
    ...(redemption.nft.physicalCard
      ? [
          prisma.physicalCard.update({
            where: { id: redemption.nft.physicalCard.id },
            data: { vaultStatus: "releasing" },
          }),
        ]
      : []),
    // Record burn transfer
    prisma.nftTransfer.create({
      data: {
        nftId: redemption.nftId,
        fromId: redemption.userId,
        toId: redemption.userId,
        type: "redemption_burn",
        txHash,
      },
    }),
  ]);

  return { txHash };
}

/**
 * Mark redemption as shipped (admin action after physical card leaves vault).
 */
export async function markRedemptionShipped(
  redemptionId: string,
  trackingInfo: { trackingNumber: string; carrier: string }
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  const redemption = await prisma.redemptionRequest.findUnique({
    where: { id: redemptionId },
    include: { nft: { include: { physicalCard: true } } },
  });

  if (!redemption || redemption.status !== "approved") {
    throw new Error("Redemption not ready for shipping");
  }

  await prisma.$transaction([
    prisma.redemptionRequest.update({
      where: { id: redemptionId },
      data: { status: "shipping" },
    }),
    ...(redemption.shippingOrderId
      ? [
          prisma.shippingOrder.update({
            where: { id: redemption.shippingOrderId },
            data: {
              status: "shipped",
              trackingNumber: trackingInfo.trackingNumber,
              carrier: trackingInfo.carrier,
            },
          }),
        ]
      : []),
    ...(redemption.nft.physicalCard
      ? [
          prisma.physicalCard.update({
            where: { id: redemption.nft.physicalCard.id },
            data: { vaultStatus: "released", releasedAt: new Date() },
          }),
        ]
      : []),
  ]);
}

/**
 * Complete redemption (admin confirms delivery).
 */
export async function completeRedemption(redemptionId: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  await prisma.redemptionRequest.update({
    where: { id: redemptionId },
    data: { status: "completed", completedAt: new Date() },
  });
}
