// Seed script — run with: node --import tsx/esm prisma/seed.mjs
// Or: npx tsx prisma/seed.mjs

import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ==========================================
  // 1. Card Series
  // ==========================================
  const pokemon = await prisma.cardSeries.upsert({
    where: { slug: "pokemon" },
    update: {},
    create: {
      slug: "pokemon",
      name: "Pokémon",
      description: "Classic Pokémon Trading Cards — Pikachu, Charizard & more",
      active: true,
      sortOrder: 1,
    },
  });

  const onepiece = await prisma.cardSeries.upsert({
    where: { slug: "one-piece" },
    update: {},
    create: {
      slug: "one-piece",
      name: "One Piece",
      description: "One Piece Card Game — Luffy, Zoro, Shanks & more",
      active: true,
      sortOrder: 2,
    },
  });

  console.log("✅ Card Series created");

  // ==========================================
  // 2. Cards
  // ==========================================
  const pokemonCards = [
    { name: "Pikachu VMAX", imageUrl: "https://images.pokemontcg.io/swsh4/44_hires.png", rarity: "tier1", marketValue: 45 },
    { name: "Charizard VMAX", imageUrl: "https://images.pokemontcg.io/swsh35/SV107_hires.png", rarity: "tier4", marketValue: 450 },
    { name: "Rayquaza VMAX", imageUrl: "https://images.pokemontcg.io/swsh7/218_hires.png", rarity: "tier3", marketValue: 180 },
    { name: "Umbreon VMAX", imageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png", rarity: "tier4", marketValue: 500 },
    { name: "Galarian Darmanitan", imageUrl: "https://images.pokemontcg.io/swsh4/37_hires.png", rarity: "tier1", marketValue: 35 },
    { name: "Centiskorch", imageUrl: "https://images.pokemontcg.io/swsh3/39_hires.png", rarity: "tier1", marketValue: 40 },
    { name: "Espeon VMAX", imageUrl: "https://images.pokemontcg.io/swsh5/65_hires.png", rarity: "tier2", marketValue: 95 },
    { name: "Lugia V", imageUrl: "https://images.pokemontcg.io/swsh12pt5/186_hires.png", rarity: "tier3", marketValue: 220 },
    { name: "Gengar VMAX", imageUrl: "https://images.pokemontcg.io/swsh8/271_hires.png", rarity: "tier2", marketValue: 75 },
    { name: "Mew VMAX", imageUrl: "https://images.pokemontcg.io/swsh9/114_hires.png", rarity: "tier2", marketValue: 85 },
    { name: "Flareon VMAX", imageUrl: "https://images.pokemontcg.io/swsh7/18_hires.png", rarity: "tier1", marketValue: 30 },
    { name: "Blaziken VMAX", imageUrl: "https://images.pokemontcg.io/swsh6/21_hires.png", rarity: "tier2", marketValue: 70 },
  ];

  const onepieceCards = [
    { name: "Monkey D. Luffy (Leader)", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/ST01-001.png", rarity: "tier1", marketValue: 50 },
    { name: "Roronoa Zoro", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/ST01-013.png", rarity: "tier1", marketValue: 40 },
    { name: "Nami", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-016.png", rarity: "tier2", marketValue: 90 },
    { name: "Portgas D. Ace", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP02-013.png", rarity: "tier2", marketValue: 85 },
    { name: "Shanks", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-120.png", rarity: "tier3", marketValue: 200 },
    { name: "Nico Robin", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-017.png", rarity: "tier3", marketValue: 175 },
    { name: "Kaido", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP03-099.png", rarity: "tier4", marketValue: 380 },
    { name: "Monkey D. Luffy (Gear 5)", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP05-119.png", rarity: "tier4", marketValue: 650 },
    { name: "Trafalgar Law", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-047.png", rarity: "tier1", marketValue: 35 },
    { name: "Sanji", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-013.png", rarity: "tier2", marketValue: 80 },
  ];

  const createdPkCards = [];
  for (const c of pokemonCards) {
    const card = await prisma.card.create({ data: { ...c, series: "Pokemon", seriesId: pokemon.id } });
    createdPkCards.push(card);
  }

  const createdOpCards = [];
  for (const c of onepieceCards) {
    const card = await prisma.card.create({ data: { ...c, series: "One Piece", seriesId: onepiece.id } });
    createdOpCards.push(card);
  }

  console.log(`✅ ${createdPkCards.length + createdOpCards.length} Cards created`);

  // ==========================================
  // 3. Gacha Packs + Probabilities + PackCards
  // ==========================================
  const packDefs = [
    {
      name: "Pokemon Basic Pack", tier: "basic", price: 100, expectedValue: 50,
      description: "Great starter pack. Common & uncommon Pokémon cards with a chance at rare pulls.",
      category: "Pokemon", seriesId: pokemon.id, cards: createdPkCards,
      probabilities: [
        { rarity: "tier1", label: "Tier 1", percentage: 80, valueRangeMin: 30, valueRangeMax: 60, color: "#22c55e" },
        { rarity: "tier2", label: "Tier 2", percentage: 15, valueRangeMin: 60, valueRangeMax: 110, color: "#3b82f6" },
        { rarity: "tier3", label: "Tier 3", percentage: 4, valueRangeMin: 110, valueRangeMax: 250, color: "#a855f7" },
        { rarity: "tier4", label: "Tier 4", percentage: 1, valueRangeMin: 250, valueRangeMax: 2000, color: "#f59e0b" },
      ],
    },
    {
      name: "Pokemon Elite Pack", tier: "elite", price: 500, expectedValue: 280,
      description: "Premium pack with better odds. Higher chance of pulling rare & ultra-rare cards.",
      category: "Pokemon", seriesId: pokemon.id, cards: createdPkCards,
      probabilities: [
        { rarity: "tier1", label: "Tier 1", percentage: 60, valueRangeMin: 100, valueRangeMax: 200, color: "#22c55e" },
        { rarity: "tier2", label: "Tier 2", percentage: 25, valueRangeMin: 200, valueRangeMax: 400, color: "#3b82f6" },
        { rarity: "tier3", label: "Tier 3", percentage: 12, valueRangeMin: 400, valueRangeMax: 800, color: "#a855f7" },
        { rarity: "tier4", label: "Tier 4", percentage: 3, valueRangeMin: 800, valueRangeMax: 5000, color: "#f59e0b" },
      ],
    },
    {
      name: "Pokemon Legendary Pack", tier: "legendary", price: 2000, expectedValue: 1200,
      description: "The ultimate pack. Guaranteed high-value cards with the best odds for legendaries.",
      category: "Pokemon", seriesId: pokemon.id, cards: createdPkCards,
      probabilities: [
        { rarity: "tier1", label: "Tier 1", percentage: 50, valueRangeMin: 500, valueRangeMax: 1000, color: "#22c55e" },
        { rarity: "tier2", label: "Tier 2", percentage: 30, valueRangeMin: 1000, valueRangeMax: 2000, color: "#3b82f6" },
        { rarity: "tier3", label: "Tier 3", percentage: 15, valueRangeMin: 2000, valueRangeMax: 5000, color: "#a855f7" },
        { rarity: "tier4", label: "Tier 4", percentage: 5, valueRangeMin: 5000, valueRangeMax: 20000, color: "#f59e0b" },
      ],
    },
    {
      name: "One Piece Basic Pack", tier: "basic", price: 100, expectedValue: 55,
      description: "Set sail! Common One Piece cards with a shot at super rares.",
      category: "One Piece", seriesId: onepiece.id, cards: createdOpCards,
      probabilities: [
        { rarity: "tier1", label: "Tier 1", percentage: 75, valueRangeMin: 30, valueRangeMax: 60, color: "#22c55e" },
        { rarity: "tier2", label: "Tier 2", percentage: 18, valueRangeMin: 60, valueRangeMax: 110, color: "#3b82f6" },
        { rarity: "tier3", label: "Tier 3", percentage: 5, valueRangeMin: 110, valueRangeMax: 250, color: "#a855f7" },
        { rarity: "tier4", label: "Tier 4", percentage: 2, valueRangeMin: 250, valueRangeMax: 2000, color: "#f59e0b" },
      ],
    },
    {
      name: "One Piece Elite Pack", tier: "elite", price: 500, expectedValue: 300,
      description: "Nakama power! Better odds for rare and legendary One Piece cards.",
      category: "One Piece", seriesId: onepiece.id, cards: createdOpCards,
      probabilities: [
        { rarity: "tier1", label: "Tier 1", percentage: 55, valueRangeMin: 100, valueRangeMax: 200, color: "#22c55e" },
        { rarity: "tier2", label: "Tier 2", percentage: 28, valueRangeMin: 200, valueRangeMax: 400, color: "#3b82f6" },
        { rarity: "tier3", label: "Tier 3", percentage: 13, valueRangeMin: 400, valueRangeMax: 800, color: "#a855f7" },
        { rarity: "tier4", label: "Tier 4", percentage: 4, valueRangeMin: 800, valueRangeMax: 5000, color: "#f59e0b" },
      ],
    },
    {
      name: "One Piece Legendary Pack", tier: "legendary", price: 2000, expectedValue: 1300,
      description: "Pirate King tier! Maximum rarity odds with the rarest One Piece cards.",
      category: "One Piece", seriesId: onepiece.id, cards: createdOpCards,
      probabilities: [
        { rarity: "tier1", label: "Tier 1", percentage: 45, valueRangeMin: 500, valueRangeMax: 1000, color: "#22c55e" },
        { rarity: "tier2", label: "Tier 2", percentage: 30, valueRangeMin: 1000, valueRangeMax: 2000, color: "#3b82f6" },
        { rarity: "tier3", label: "Tier 3", percentage: 18, valueRangeMin: 2000, valueRangeMax: 5000, color: "#a855f7" },
        { rarity: "tier4", label: "Tier 4", percentage: 7, valueRangeMin: 5000, valueRangeMax: 20000, color: "#f59e0b" },
      ],
    },
  ];

  for (const packDef of packDefs) {
    const { cards, probabilities, ...packData } = packDef;
    const pack = await prisma.gachaPack.create({ data: packData });

    await prisma.packProbability.createMany({
      data: probabilities.map((p) => ({ ...p, packId: pack.id })),
    });

    await prisma.packCard.createMany({
      data: cards.map((c) => ({ packId: pack.id, cardId: c.id })),
    });

    console.log(`  📦 ${pack.name} (${cards.length} cards, ${probabilities.length} tiers)`);
  }

  console.log("✅ Gacha Packs created");

  // ==========================================
  // 4. Coin Packages
  // ==========================================
  await prisma.coinPackage.createMany({
    data: [
      { coins: 500, bonusCoins: 0, priceAed: 1800, popular: false, sortOrder: 1 },
      { coins: 1200, bonusCoins: 200, priceAed: 3700, popular: true, sortOrder: 2 },
      { coins: 3500, bonusCoins: 500, priceAed: 9200, popular: false, sortOrder: 3 },
      { coins: 10000, bonusCoins: 2000, priceAed: 18400, popular: false, sortOrder: 4 },
    ],
  });
  console.log("✅ Coin Packages created");

  // ==========================================
  // 5. Exchange Rates
  // ==========================================
  const now = new Date();
  for (const rate of [
    { currency: "USD", rateToAed: 3.6725, source: "manual", validAt: now },
    { currency: "EUR", rateToAed: 3.98, source: "manual", validAt: now },
    { currency: "JPY", rateToAed: 0.0245, source: "manual", validAt: now },
    { currency: "GBP", rateToAed: 4.64, source: "manual", validAt: now },
  ]) {
    await prisma.exchangeRate.create({ data: rate });
  }
  console.log("✅ Exchange Rates created");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
