/**
 * IPFS / Pinata integration for NFT metadata and images.
 */

import { PinataSDK } from "pinata-web3";
import { IPFS_GATEWAY } from "./config";

let pinataClient: PinataSDK | null = null;

function getPinata(): PinataSDK {
  if (!pinataClient) {
    const jwt = process.env.PINATA_JWT;
    const gateway = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";
    if (!jwt) throw new Error("PINATA_JWT not set");
    pinataClient = new PinataSDK({ pinataJwt: jwt, pinataGateway: gateway });
  }
  return pinataClient;
}

export interface NftMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI of the card image
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}

/**
 * Upload card image to IPFS.
 * @param imageBuffer Image file buffer (high-res scan)
 * @param fileName File name for the image
 * @returns IPFS URI (ipfs://Qm...)
 */
export async function uploadImage(
  imageBuffer: Uint8Array,
  fileName: string
): Promise<string> {
  const pinata = getPinata();
  // Convert to ArrayBuffer to satisfy BlobPart type
  const arrayBuffer = imageBuffer.buffer.slice(
    imageBuffer.byteOffset,
    imageBuffer.byteOffset + imageBuffer.byteLength
  ) as ArrayBuffer;
  const file = new File([arrayBuffer], fileName, { type: "image/png" });
  const result = await pinata.upload.file(file);
  return `ipfs://${result.IpfsHash}`;
}

/**
 * Upload NFT metadata JSON to IPFS.
 */
export async function uploadMetadata(metadata: NftMetadata): Promise<string> {
  const pinata = getPinata();
  const result = await pinata.upload.json(metadata);
  return `ipfs://${result.IpfsHash}`;
}

/**
 * Build standard NFT metadata for a trading card.
 */
export function buildCardMetadata(params: {
  cardName: string;
  series: string;
  rarity: string;
  gradeProvider?: string;
  gradeScore?: number;
  certificateNo?: string;
  imageIpfsUri: string;
  marketValueAed?: number;
  vaultLocation?: string;
  tokenId?: number;
}): NftMetadata {
  const rarityLabels: Record<string, string> = {
    tier1: "Common",
    tier2: "Rare",
    tier3: "Ultra Rare",
    tier4: "Secret Rare",
  };

  const attributes: NftMetadata["attributes"] = [
    { trait_type: "Series", value: params.series },
    { trait_type: "Rarity", value: rarityLabels[params.rarity] || params.rarity },
  ];

  if (params.gradeProvider) {
    attributes.push({ trait_type: "Grade Provider", value: params.gradeProvider });
  }
  if (params.gradeScore !== undefined) {
    attributes.push({ trait_type: "Grade", value: params.gradeScore, display_type: "number" });
  }
  if (params.certificateNo) {
    attributes.push({ trait_type: "Certificate No", value: params.certificateNo });
  }
  if (params.vaultLocation) {
    attributes.push({ trait_type: "Vault Location", value: params.vaultLocation });
  }
  if (params.marketValueAed !== undefined) {
    attributes.push({ trait_type: "Market Value (AED)", value: params.marketValueAed, display_type: "number" });
  }

  const externalUrl = params.tokenId
    ? `${process.env.NEXT_PUBLIC_APP_URL}/nft/${params.tokenId}`
    : undefined;

  return {
    name: params.cardName,
    description: `${params.series} - ${params.cardName}. Authenticated and stored in a secure vault. This NFT represents ownership of the physical card.`,
    image: params.imageIpfsUri,
    external_url: externalUrl,
    attributes,
  };
}

/**
 * Convert IPFS URI to HTTP gateway URL for display.
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri.startsWith("ipfs://")) return ipfsUri;
  const hash = ipfsUri.replace("ipfs://", "");
  return `${IPFS_GATEWAY}${hash}`;
}
