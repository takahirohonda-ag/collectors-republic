/**
 * Blockchain interaction layer.
 * Server-side only — handles contract calls via relayer (gasless for users).
 */

import { ethers } from "ethers";
import { getActiveChain, getContractAddress } from "./config";

// ABI for the functions we call (subset of full ABI)
const CONTRACT_ABI = [
  "function mintCard(address to, string uri, string certificateNo) returns (uint256)",
  "function batchMint(address[] to, string[] uris, string[] certificateNos) returns (uint256[])",
  "function redeemCard(uint256 tokenId)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getCertificateNumber(uint256 tokenId) view returns (string)",
  "function isInVault(uint256 tokenId) view returns (bool)",
  "function totalMinted() view returns (uint256)",
  "function platformFeeBps() view returns (uint256)",
  "event CardMinted(uint256 indexed tokenId, address indexed to, string certificateNo)",
  "event CardRedeemed(uint256 indexed tokenId, address indexed owner)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

let provider: ethers.JsonRpcProvider | null = null;
let relayerWallet: ethers.Wallet | null = null;

/**
 * Get JSON-RPC provider for the active chain.
 */
export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    const chain = getActiveChain();
    const rpcUrl = process.env.POLYGON_RPC_URL || chain.rpcUrl;
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
}

/**
 * Get the relayer wallet (server-side, pays gas on behalf of users).
 */
function getRelayer(): ethers.Wallet {
  if (!relayerWallet) {
    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!privateKey) throw new Error("RELAYER_PRIVATE_KEY not set");
    relayerWallet = new ethers.Wallet(privateKey, getProvider());
  }
  return relayerWallet;
}

/**
 * Get contract instance for read operations.
 */
export function getReadContract(): ethers.Contract {
  return new ethers.Contract(getContractAddress(), CONTRACT_ABI, getProvider());
}

/**
 * Get contract instance for write operations (via relayer).
 */
function getWriteContract(): ethers.Contract {
  return new ethers.Contract(getContractAddress(), CONTRACT_ABI, getRelayer());
}

/**
 * Mint a single NFT. Called by the backend after gacha pull.
 * @returns { tokenId, txHash }
 */
export async function mintNft(params: {
  toAddress: string;
  metadataUri: string;
  certificateNo: string;
}): Promise<{ tokenId: number; txHash: string }> {
  const contract = getWriteContract();
  const tx = await contract.mintCard(
    params.toAddress,
    params.metadataUri,
    params.certificateNo
  );
  const receipt = await tx.wait();

  // Extract tokenId from CardMinted event
  const mintEvent = receipt.logs
    .map((log: ethers.Log) => {
      try {
        return contract.interface.parseLog({ topics: [...log.topics], data: log.data });
      } catch {
        return null;
      }
    })
    .find((e: ethers.LogDescription | null) => e?.name === "CardMinted");

  const tokenId = mintEvent ? Number(mintEvent.args.tokenId) : 0;

  return { tokenId, txHash: receipt.hash };
}

/**
 * Batch mint multiple NFTs in a single transaction.
 */
export async function batchMintNfts(params: {
  toAddresses: string[];
  metadataUris: string[];
  certificateNos: string[];
}): Promise<{ tokenIds: number[]; txHash: string }> {
  const contract = getWriteContract();
  const tx = await contract.batchMint(
    params.toAddresses,
    params.metadataUris,
    params.certificateNos
  );
  const receipt = await tx.wait();

  // Extract tokenIds from events
  const tokenIds = receipt.logs
    .map((log: ethers.Log) => {
      try {
        return contract.interface.parseLog({ topics: [...log.topics], data: log.data });
      } catch {
        return null;
      }
    })
    .filter((e: ethers.LogDescription | null) => e?.name === "CardMinted")
    .map((e: ethers.LogDescription) => Number(e.args.tokenId));

  return { tokenIds, txHash: receipt.hash };
}

/**
 * Burn NFT for redemption (physical card release).
 */
export async function redeemNft(tokenId: number): Promise<string> {
  const contract = getWriteContract();
  const tx = await contract.redeemCard(tokenId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Read on-chain data for an NFT.
 */
export async function getNftOnChainData(tokenId: number) {
  const contract = getReadContract();
  const [owner, uri, certNo, inVault] = await Promise.all([
    contract.ownerOf(tokenId),
    contract.tokenURI(tokenId),
    contract.getCertificateNumber(tokenId),
    contract.isInVault(tokenId),
  ]);
  return { owner, uri, certificateNo: certNo, inVault };
}

/**
 * Get total minted count.
 */
export async function getTotalMinted(): Promise<number> {
  const contract = getReadContract();
  return Number(await contract.totalMinted());
}
