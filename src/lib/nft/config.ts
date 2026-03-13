/**
 * NFT/Blockchain configuration.
 * All chain-specific settings are centralized here.
 */

// Chain configuration
export const CHAIN_CONFIG = {
  // Polygon Amoy testnet for development
  testnet: {
    chainId: 80002,
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    blockExplorer: "https://amoy.polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
  // Polygon mainnet for production
  mainnet: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  },
} as const;

// Get active chain based on environment
export function getActiveChain() {
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? CHAIN_CONFIG.mainnet : CHAIN_CONFIG.testnet;
}

// Contract addresses (set after deployment)
export function getContractAddress(): string {
  const address = process.env.NFT_CONTRACT_ADDRESS;
  if (!address) throw new Error("NFT_CONTRACT_ADDRESS not set");
  return address;
}

// Platform fee: 2.5% (250 basis points) — same as Courtyard
export const PLATFORM_FEE_BPS = 250;

// Sell-back rate: 90% of FMV (Courtyard-style instant buyback)
export const SELL_BACK_RATE = 0.9;

// IPFS gateway
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// thirdweb client ID (public)
export function getThirdwebClientId(): string {
  return process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";
}
