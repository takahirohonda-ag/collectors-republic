/**
 * NFT minting orchestrator.
 * Coordinates wallet creation, metadata upload, and on-chain minting.
 * Called after a successful gacha pull.
 */

import { getPrisma } from "@/lib/prisma";
import { getOrCreateWallet } from "./wallet";
import { buildCardMetadata, uploadMetadata } from "./ipfs";
import { mintNft } from "./blockchain";
import { getContractAddress } from "./config";
import { getActiveChain } from "./config";

interface MintCardParams {
  userId: string;
  cardId: string;
  cardName: string;
  cardSeries: string;
  cardRarity: string;
  cardImageUrl: string; // existing URL from card catalog (will use as-is for MVP)
  marketValue: number;
  physicalCardId?: string;
  certificateNo?: string;
  gradeProvider?: string;
  gradeScore?: number;
}

interface MintResult {
  nftId: string;
  tokenId: number;
  txHash: string;
  metadataUri: string;
  walletAddress: string;
}

/**
 * Mint an NFT for a card obtained from gacha.
 * This is an async process — gacha result returns immediately,
 * NFT minting happens in the background.
 */
export async function mintCardNft(params: MintCardParams): Promise<MintResult> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  // 1. Ensure user has a wallet
  const { address: walletAddress } = await getOrCreateWallet(params.userId);

  // 2. Build and upload metadata to IPFS
  const metadata = buildCardMetadata({
    cardName: params.cardName,
    series: params.cardSeries,
    rarity: params.cardRarity,
    imageIpfsUri: params.cardImageUrl, // For MVP: use existing URL. Future: upload to IPFS
    marketValueAed: params.marketValue,
    gradeProvider: params.gradeProvider,
    gradeScore: params.gradeScore,
    certificateNo: params.certificateNo,
    vaultLocation: "dubai-main",
  });

  const metadataUri = await uploadMetadata(metadata);

  // 3. Create NFT record in DB (status: minting)
  const chain = getActiveChain();
  const nftRecord = await prisma.nft.create({
    data: {
      tokenId: 0, // placeholder, updated after mint
      contractAddress: getContractAddress(),
      chainId: chain.chainId,
      metadataUri,
      imageUri: params.cardImageUrl,
      cardId: params.cardId,
      ownerId: params.userId,
      physicalCardId: params.physicalCardId || null,
      status: "minting",
    },
  });

  try {
    // 4. Mint on-chain
    const { tokenId, txHash } = await mintNft({
      toAddress: walletAddress,
      metadataUri,
      certificateNo: params.certificateNo || `CR-${nftRecord.id.slice(0, 8)}`,
    });

    // 5. Update DB with on-chain data
    await prisma.nft.update({
      where: { id: nftRecord.id },
      data: {
        tokenId,
        mintTxHash: txHash,
        mintedAt: new Date(),
        status: "active",
      },
    });

    // 6. Record transfer history (mint)
    await prisma.nftTransfer.create({
      data: {
        nftId: nftRecord.id,
        fromId: null, // mint = no sender
        toId: params.userId,
        type: "mint",
        txHash,
      },
    });

    return {
      nftId: nftRecord.id,
      tokenId,
      txHash,
      metadataUri,
      walletAddress,
    };
  } catch (error) {
    // Mark as failed but don't delete — can be retried
    await prisma.nft.update({
      where: { id: nftRecord.id },
      data: { status: "minting" }, // stays in minting state for retry
    });
    throw error;
  }
}

/**
 * Retry minting for NFTs stuck in "minting" status.
 * Called by a background job.
 */
export async function retryPendingMints(): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) return 0;

  const pendingNfts = await prisma.nft.findMany({
    where: {
      status: "minting",
      tokenId: 0,
      createdAt: { lt: new Date(Date.now() - 60_000) }, // at least 1 min old
    },
    include: {
      card: true,
      owner: { include: { wallet: true } },
    },
    take: 10, // process in batches
  });

  let retried = 0;
  for (const nft of pendingNfts) {
    if (!nft.owner.wallet) continue;
    try {
      const { tokenId, txHash } = await mintNft({
        toAddress: nft.owner.wallet.address,
        metadataUri: nft.metadataUri,
        certificateNo: `CR-${nft.id.slice(0, 8)}`,
      });

      await prisma.nft.update({
        where: { id: nft.id },
        data: { tokenId, mintTxHash: txHash, mintedAt: new Date(), status: "active" },
      });

      await prisma.nftTransfer.create({
        data: {
          nftId: nft.id,
          fromId: null,
          toId: nft.ownerId,
          type: "mint",
          txHash,
        },
      });

      retried++;
    } catch {
      // Skip and retry next cycle
    }
  }
  return retried;
}
