import { Card, GachaPack, PulledCard, RankingEntry, CollectionItem } from "@/types";

const pokemonCards: Card[] = [
  { id: "c1", name: "Pikachu VMAX", imageUrl: "/cards/pikachu-vmax.jpg", rarity: "tier1", marketValue: 45, series: "Pokemon" },
  { id: "c2", name: "Charizard GX", imageUrl: "/cards/charizard-gx.jpg", rarity: "tier2", marketValue: 85, series: "Pokemon" },
  { id: "c3", name: "Rayquaza V Alt Art", imageUrl: "/cards/rayquaza-v.jpg", rarity: "tier3", marketValue: 180, series: "Pokemon" },
  { id: "c4", name: "Umbreon VMAX Alt Art", imageUrl: "/cards/umbreon-vmax.jpg", rarity: "tier4", marketValue: 450, series: "Pokemon" },
  { id: "c5", name: "Mewtwo GX", imageUrl: "/cards/mewtwo-gx.jpg", rarity: "tier1", marketValue: 35, series: "Pokemon" },
  { id: "c6", name: "Dragonite V", imageUrl: "/cards/dragonite-v.jpg", rarity: "tier1", marketValue: 40, series: "Pokemon" },
  { id: "c7", name: "Espeon VMAX", imageUrl: "/cards/espeon-vmax.jpg", rarity: "tier2", marketValue: 95, series: "Pokemon" },
  { id: "c8", name: "Lugia V Alt Art", imageUrl: "/cards/lugia-v.jpg", rarity: "tier3", marketValue: 220, series: "Pokemon" },
];

export const gachaPacks: GachaPack[] = [
  {
    id: "pokemon-basic",
    name: "Pokemon Basic Pack",
    tier: "basic",
    price: 100,
    expectedValue: 50,
    machineImageUrl: "/machines/pokemon-basic.png",
    description: "Sell any revealed card back instantly for 80% of its market value. Buy with confidence — your downside is protected.",
    category: "Pokemon",
    probabilities: [
      { rarity: "tier1", label: "Tier 1", valueRange: "$30 - $60", percentage: 80, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "$60 - $110", percentage: 15, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "$110 - $250", percentage: 4, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "$250 - $2,000", percentage: 1, color: "#f59e0b" },
    ],
    cardsInPack: pokemonCards,
  },
  {
    id: "pokemon-elite",
    name: "Pokemon Elite Pack",
    tier: "elite",
    price: 500,
    expectedValue: 280,
    machineImageUrl: "/machines/pokemon-elite.png",
    description: "Premium selection with higher odds of rare pulls. Each pack guarantees Tier 2 or above.",
    category: "Pokemon",
    probabilities: [
      { rarity: "tier1", label: "Tier 1", valueRange: "$100 - $200", percentage: 60, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "$200 - $400", percentage: 25, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "$400 - $800", percentage: 12, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "$800 - $5,000", percentage: 3, color: "#f59e0b" },
    ],
    cardsInPack: pokemonCards,
  },
  {
    id: "pokemon-legendary",
    name: "Pokemon Legendary Pack",
    tier: "legendary",
    price: 2000,
    expectedValue: 1200,
    machineImageUrl: "/machines/pokemon-legendary.png",
    description: "The ultimate pack for serious collectors. Every card is a gem.",
    category: "Pokemon",
    probabilities: [
      { rarity: "tier1", label: "Tier 1", valueRange: "$500 - $1,000", percentage: 50, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "$1,000 - $2,000", percentage: 30, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "$2,000 - $5,000", percentage: 15, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "$5,000 - $20,000", percentage: 5, color: "#f59e0b" },
    ],
    cardsInPack: pokemonCards,
  },
];

export const justPulledCards: PulledCard[] = [
  { id: "p1", card: pokemonCards[0], userId: "u1", username: "CryptoKnight", avatarUrl: "/avatars/1.jpg", pulledAt: new Date(Date.now() - 120000), packName: "Pokemon Basic Pack" },
  { id: "p2", card: pokemonCards[1], userId: "u2", username: "ZenTrader", avatarUrl: "/avatars/2.jpg", pulledAt: new Date(Date.now() - 300000), packName: "Pokemon Basic Pack" },
  { id: "p3", card: pokemonCards[3], userId: "u3", username: "CRYPTOWHALE", avatarUrl: "/avatars/3.jpg", pulledAt: new Date(Date.now() - 600000), packName: "Pokemon Elite Pack" },
  { id: "p4", card: pokemonCards[2], userId: "u1", username: "CryptoKnight", avatarUrl: "/avatars/1.jpg", pulledAt: new Date(Date.now() - 900000), packName: "Pokemon Basic Pack" },
];

export const rankings: RankingEntry[] = [
  { rank: 1, user: { id: "u3", username: "CRYPTOWHALE", avatarUrl: "/avatars/3.jpg" }, totalCoins: 1394, verified: true },
  { rank: 2, user: { id: "u4", username: "8Nodes1", avatarUrl: "/avatars/4.jpg" }, totalCoins: 700, verified: false },
  { rank: 3, user: { id: "u1", username: "CryptoKnight", avatarUrl: "/avatars/1.jpg" }, totalCoins: 612400, verified: true },
  { rank: 4, user: { id: "u5", username: "CryptoKnight", avatarUrl: "/avatars/5.jpg" }, totalCoins: 610400, verified: true },
  { rank: 5, user: { id: "u2", username: "ZenTrader", avatarUrl: "/avatars/2.jpg" }, totalCoins: 600400, verified: false },
];

export const mockCollection: CollectionItem[] = pokemonCards.map((card, i) => ({
  id: `col-${i}`,
  card,
  acquiredAt: new Date(Date.now() - i * 86400000),
  status: "in_collection" as const,
  sellBackValue: Math.floor(card.marketValue * 0.8),
}));

// Gacha probability engine
export function pullCard(pack: GachaPack): Card {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const prob of pack.probabilities) {
    cumulative += prob.percentage;
    if (rand <= cumulative) {
      const cardsOfRarity = pack.cardsInPack.filter(c => c.rarity === prob.rarity);
      if (cardsOfRarity.length > 0) {
        return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
      }
    }
  }

  // Fallback to tier1
  const tier1Cards = pack.cardsInPack.filter(c => c.rarity === "tier1");
  return tier1Cards[Math.floor(Math.random() * tier1Cards.length)];
}
