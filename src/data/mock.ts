import { Card, GachaPack, PulledCard, RankingEntry, CollectionItem } from "@/types";

// === Pokemon Cards ===
// Card names matched to images from images.pokemontcg.io
const pokemonCards: Card[] = [
  { id: "pk1", name: "Pikachu VMAX", imageUrl: "https://images.pokemontcg.io/swsh4/44_hires.png", rarity: "tier1", marketValue: 45, series: "Pokemon" },
  { id: "pk2", name: "Charizard VMAX", imageUrl: "https://images.pokemontcg.io/swsh3/20_hires.png", rarity: "tier4", marketValue: 450, series: "Pokemon" },
  { id: "pk3", name: "Rayquaza VMAX", imageUrl: "https://images.pokemontcg.io/swsh7/218_hires.png", rarity: "tier3", marketValue: 180, series: "Pokemon" },
  { id: "pk4", name: "Umbreon VMAX", imageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png", rarity: "tier4", marketValue: 500, series: "Pokemon" },
  { id: "pk5", name: "Galarian Darmanitan", imageUrl: "https://images.pokemontcg.io/swsh8/72_hires.png", rarity: "tier1", marketValue: 35, series: "Pokemon" },
  { id: "pk6", name: "Centiskorch", imageUrl: "https://images.pokemontcg.io/swsh8/49_hires.png", rarity: "tier1", marketValue: 40, series: "Pokemon" },
  { id: "pk7", name: "Espeon VMAX", imageUrl: "https://images.pokemontcg.io/swsh7/65_hires.png", rarity: "tier2", marketValue: 95, series: "Pokemon" },
  { id: "pk8", name: "Lugia V", imageUrl: "https://images.pokemontcg.io/swsh12pt5/186_hires.png", rarity: "tier3", marketValue: 220, series: "Pokemon" },
  { id: "pk9", name: "Gengar VMAX", imageUrl: "https://images.pokemontcg.io/swsh8/271_hires.png", rarity: "tier2", marketValue: 75, series: "Pokemon" },
  { id: "pk10", name: "Mew VMAX", imageUrl: "https://images.pokemontcg.io/swsh8/114_hires.png", rarity: "tier2", marketValue: 85, series: "Pokemon" },
  { id: "pk11", name: "Flareon VMAX", imageUrl: "https://images.pokemontcg.io/swsh7/18_hires.png", rarity: "tier1", marketValue: 30, series: "Pokemon" },
  { id: "pk12", name: "Blaziken VMAX", imageUrl: "https://images.pokemontcg.io/swsh6/21_hires.png", rarity: "tier2", marketValue: 70, series: "Pokemon" },
];

// === One Piece Cards ===
// Card images from Limitless TCG CDN (One Piece TCG)
const onepieceCards: Card[] = [
  { id: "op1", name: "Monkey D. Luffy (Leader)", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-003_EN.webp", rarity: "tier1", marketValue: 50, series: "One Piece" },
  { id: "op2", name: "Roronoa Zoro", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-025_EN.webp", rarity: "tier1", marketValue: 40, series: "One Piece" },
  { id: "op3", name: "Nami", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-016_EN.webp", rarity: "tier2", marketValue: 90, series: "One Piece" },
  { id: "op4", name: "Portgas D. Ace", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP02/OP02-013_EN.webp", rarity: "tier2", marketValue: 85, series: "One Piece" },
  { id: "op5", name: "Shanks", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-120_EN.webp", rarity: "tier3", marketValue: 200, series: "One Piece" },
  { id: "op6", name: "Nico Robin", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-017_EN.webp", rarity: "tier3", marketValue: 175, series: "One Piece" },
  { id: "op7", name: "Kaido", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-094_EN.webp", rarity: "tier4", marketValue: 380, series: "One Piece" },
  { id: "op8", name: "Monkey D. Luffy (Gear 5)", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP05/OP05-119_EN.webp", rarity: "tier4", marketValue: 650, series: "One Piece" },
  { id: "op9", name: "Trafalgar Law", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-002_EN.webp", rarity: "tier1", marketValue: 35, series: "One Piece" },
  { id: "op10", name: "Sanji", imageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-013_EN.webp", rarity: "tier2", marketValue: 80, series: "One Piece" },
];

// === Gacha Packs ===
// All values in Coins
export const gachaPacks: GachaPack[] = [
  // Pokemon Packs
  {
    id: "pokemon-basic",
    name: "Pokemon Basic Pack",
    tier: "basic",
    price: 100,
    expectedValue: 50,
    machineImageUrl: "/machines/pokemon-basic.png",
    description: "Sell any revealed card back instantly for 80% of its coin value. Buy with confidence — your downside is protected.",
    category: "Pokemon",
    probabilities: [
      { rarity: "tier1", label: "Tier 1", valueRange: "30 - 60 Coins", percentage: 80, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "60 - 110 Coins", percentage: 15, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "110 - 250 Coins", percentage: 4, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "250 - 2,000 Coins", percentage: 1, color: "#f59e0b" },
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
      { rarity: "tier1", label: "Tier 1", valueRange: "100 - 200 Coins", percentage: 60, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "200 - 400 Coins", percentage: 25, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "400 - 800 Coins", percentage: 12, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "800 - 5,000 Coins", percentage: 3, color: "#f59e0b" },
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
      { rarity: "tier1", label: "Tier 1", valueRange: "500 - 1,000 Coins", percentage: 50, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "1,000 - 2,000 Coins", percentage: 30, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "2,000 - 5,000 Coins", percentage: 15, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "5,000 - 20,000 Coins", percentage: 5, color: "#f59e0b" },
    ],
    cardsInPack: pokemonCards,
  },
  // One Piece Packs
  {
    id: "onepiece-basic",
    name: "One Piece Basic Pack",
    tier: "basic",
    price: 100,
    expectedValue: 55,
    machineImageUrl: "/machines/onepiece-basic.png",
    description: "Open packs from the hottest TCG on the market. Sell back any card instantly at 80% coin value.",
    category: "One Piece",
    probabilities: [
      { rarity: "tier1", label: "Tier 1", valueRange: "30 - 60 Coins", percentage: 78, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "60 - 110 Coins", percentage: 16, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "110 - 250 Coins", percentage: 5, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "250 - 2,000 Coins", percentage: 1, color: "#f59e0b" },
    ],
    cardsInPack: onepieceCards,
  },
  {
    id: "onepiece-elite",
    name: "One Piece Elite Pack",
    tier: "elite",
    price: 500,
    expectedValue: 300,
    machineImageUrl: "/machines/onepiece-elite.png",
    description: "Higher rarity guaranteed. Manga Art and Parallel Art cards await inside.",
    category: "One Piece",
    probabilities: [
      { rarity: "tier1", label: "Tier 1", valueRange: "100 - 200 Coins", percentage: 55, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "200 - 400 Coins", percentage: 28, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "400 - 800 Coins", percentage: 14, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "800 - 5,000 Coins", percentage: 3, color: "#f59e0b" },
    ],
    cardsInPack: onepieceCards,
  },
  {
    id: "onepiece-legendary",
    name: "One Piece Legendary Pack",
    tier: "legendary",
    price: 2000,
    expectedValue: 1300,
    machineImageUrl: "/machines/onepiece-legendary.png",
    description: "The rarest One Piece cards in existence. Gear 5 Luffy Parallel awaits.",
    category: "One Piece",
    probabilities: [
      { rarity: "tier1", label: "Tier 1", valueRange: "500 - 1,000 Coins", percentage: 48, color: "#22c55e" },
      { rarity: "tier2", label: "Tier 2", valueRange: "1,000 - 2,000 Coins", percentage: 30, color: "#3b82f6" },
      { rarity: "tier3", label: "Tier 3", valueRange: "2,000 - 5,000 Coins", percentage: 16, color: "#a855f7" },
      { rarity: "tier4", label: "Tier 4", valueRange: "5,000 - 20,000 Coins", percentage: 6, color: "#f59e0b" },
    ],
    cardsInPack: onepieceCards,
  },
];

export const justPulledCards: PulledCard[] = [
  { id: "p1", card: pokemonCards[0], userId: "u1", username: "CryptoKnight", avatarUrl: "/avatars/1.jpg", pulledAt: new Date(Date.now() - 120000), packName: "Pokemon Basic Pack" },
  { id: "p2", card: pokemonCards[6], userId: "u2", username: "ZenTrader", avatarUrl: "/avatars/2.jpg", pulledAt: new Date(Date.now() - 300000), packName: "Pokemon Basic Pack" },
  { id: "p3", card: onepieceCards[7], userId: "u3", username: "CRYPTOWHALE", avatarUrl: "/avatars/3.jpg", pulledAt: new Date(Date.now() - 600000), packName: "One Piece Elite Pack" },
  { id: "p4", card: pokemonCards[2], userId: "u4", username: "CardMaster99", avatarUrl: "/avatars/1.jpg", pulledAt: new Date(Date.now() - 900000), packName: "Pokemon Basic Pack" },
  { id: "p5", card: onepieceCards[4], userId: "u5", username: "StrawHatFan", avatarUrl: "/avatars/2.jpg", pulledAt: new Date(Date.now() - 1200000), packName: "One Piece Basic Pack" },
  { id: "p6", card: pokemonCards[1], userId: "u1", username: "CryptoKnight", avatarUrl: "/avatars/1.jpg", pulledAt: new Date(Date.now() - 1500000), packName: "Pokemon Legendary Pack" },
];

export const rankings: RankingEntry[] = [
  { rank: 1, user: { id: "u3", username: "CRYPTOWHALE", avatarUrl: "/avatars/3.jpg" }, totalCoins: 1394, verified: true },
  { rank: 2, user: { id: "u4", username: "8Nodes1", avatarUrl: "/avatars/4.jpg" }, totalCoins: 700, verified: false },
  { rank: 3, user: { id: "u1", username: "CryptoKnight", avatarUrl: "/avatars/1.jpg" }, totalCoins: 612400, verified: true },
  { rank: 4, user: { id: "u5", username: "StrawHatFan", avatarUrl: "/avatars/5.jpg" }, totalCoins: 610400, verified: true },
  { rank: 5, user: { id: "u2", username: "ZenTrader", avatarUrl: "/avatars/2.jpg" }, totalCoins: 600400, verified: false },
];

const allCards = [...pokemonCards, ...onepieceCards];

export const mockCollection: CollectionItem[] = allCards.slice(0, 10).map((card, i) => ({
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

  const tier1Cards = pack.cardsInPack.filter(c => c.rarity === "tier1");
  return tier1Cards[Math.floor(Math.random() * tier1Cards.length)];
}

// Helper: get categories
export const categories = ["Pokemon", "One Piece"] as const;
export type CardCategory = (typeof categories)[number];
