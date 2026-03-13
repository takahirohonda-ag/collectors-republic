export type PackTier = "basic" | "elite" | "legendary";

export type CardRarity = "tier1" | "tier2" | "tier3" | "tier4";

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

export interface CollectionItem {
  id: string;
  card: Card;
  acquiredAt: Date;
  status: "in_collection" | "shipping" | "shipped" | "sold_back";
  sellBackValue: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  coinBalance: number;
  pointBalance: number;
  memberTier: "bronze" | "silver" | "gold" | "platinum";
}

export interface RankingEntry {
  rank: number;
  user: Pick<User, "id" | "username" | "avatarUrl">;
  totalCoins: number;
  verified: boolean;
}
