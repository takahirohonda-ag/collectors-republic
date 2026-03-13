export type PackTier = "basic" | "elite" | "legendary";

export type CardRarity = "tier1" | "tier2" | "tier3" | "tier4";

export type NftStatus = "minting" | "active" | "listed" | "redeemed" | "burned";

export type ListingStatus = "active" | "sold" | "cancelled";

export type OfferStatus = "pending" | "accepted" | "rejected" | "expired" | "cancelled";

export type RedemptionStatus = "pending" | "approved" | "shipping" | "completed" | "cancelled";

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  rarity: CardRarity;
  marketValue: number;
  series: string;
}

export interface ProbabilityTier {
  rarity: CardRarity;
  label: string;
  valueRange: string;
  percentage: number;
  color: string;
}

export interface GachaPack {
  id: string;
  name: string;
  tier: PackTier;
  price: number;
  expectedValue: number;
  machineImageUrl: string;
  description: string;
  probabilities: ProbabilityTier[];
  cardsInPack: Card[];
  category: string;
}

export interface PulledCard {
  id: string;
  card: Card;
  userId: string;
  username: string;
  avatarUrl: string;
  pulledAt: Date;
  packName: string;
}

export interface NftInfo {
  id: string;
  tokenId: number;
  contractAddress: string;
  chainId: number;
  metadataUri: string;
  imageUri?: string;
  status: NftStatus;
  mintTxHash?: string;
  mintedAt?: Date;
}

export interface CollectionItem {
  id: string;
  card: Card;
  acquiredAt: Date;
  status: "in_collection" | "shipping" | "shipped" | "sold_back" | "listed" | "redeemed";
  sellBackValue: number;
  nft?: NftInfo;
}

export interface MarketplaceListing {
  id: string;
  nft: NftInfo & { card: Card };
  seller: Pick<User, "id" | "username" | "avatarUrl">;
  priceCoins: number;
  priceAed?: number;
  status: ListingStatus;
  listedAt: Date;
}

export interface MarketplaceOffer {
  id: string;
  nftId: string;
  bidder: Pick<User, "id" | "username" | "avatarUrl">;
  priceCoins: number;
  status: OfferStatus;
  expiresAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  coinBalance: number;
  pointBalance: number;
  memberTier: "bronze" | "silver" | "gold" | "platinum";
  walletAddress?: string;
}

export interface RankingEntry {
  rank: number;
  user: Pick<User, "id" | "username" | "avatarUrl">;
  totalCoins: number;
  verified: boolean;
}
