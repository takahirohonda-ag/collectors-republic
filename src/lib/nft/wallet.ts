/**
 * Embedded wallet management.
 * Users get a wallet automatically on signup — no MetaMask needed.
 * Uses thirdweb's in-app wallet for seamless UX.
 */

import { getPrisma } from "@/lib/prisma";
import { ethers } from "ethers";

/**
 * Get or create a wallet for a user.
 * Called during gacha pull or first NFT interaction.
 *
 * For MVP: generates a server-managed wallet (custodial).
 * Future: migrate to thirdweb embedded wallet for true self-custody.
 */
export async function getOrCreateWallet(userId: string): Promise<{
  address: string;
  isNew: boolean;
}> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not connected");

  // Check existing wallet
  const existing = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (existing) {
    return { address: existing.address, isNew: false };
  }

  // Generate a new wallet
  // For MVP: deterministic wallet from userId + server secret
  // This keeps things simple while still being on-chain compatible
  const serverSecret = process.env.WALLET_ENCRYPTION_KEY;
  if (!serverSecret) throw new Error("WALLET_ENCRYPTION_KEY not set");

  const seed = ethers.keccak256(
    ethers.toUtf8Bytes(`${serverSecret}:${userId}`)
  );
  const wallet = new ethers.Wallet(seed);

  // Store in DB
  await prisma.wallet.create({
    data: {
      userId,
      address: wallet.address,
      provider: "server-managed",
    },
  });

  return { address: wallet.address, isNew: true };
}

/**
 * Get a user's wallet address. Returns null if not created yet.
 */
export async function getWalletAddress(userId: string): Promise<string | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { address: true },
  });

  return wallet?.address || null;
}

/**
 * Get a signing wallet for a user (for server-side operations like listing NFTs).
 */
export function getUserWalletSigner(userId: string): ethers.Wallet {
  const serverSecret = process.env.WALLET_ENCRYPTION_KEY;
  if (!serverSecret) throw new Error("WALLET_ENCRYPTION_KEY not set");

  const seed = ethers.keccak256(
    ethers.toUtf8Bytes(`${serverSecret}:${userId}`)
  );
  return new ethers.Wallet(seed);
}
