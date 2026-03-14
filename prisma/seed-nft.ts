import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new (PrismaClient as any)({ adapter });

async function main() {
  console.log("🎴 Seeding NFT demo data...");

  // Get existing cards
  const cards = await prisma.card.findMany({ take: 22 });
  if (cards.length === 0) {
    throw new Error("No cards found. Run basic seed first: npx tsx prisma/seed.ts");
  }

  // ==========================================
  // 1. Demo Users
  // ==========================================
  const users = [
    { email: "demo@collectors.ae", username: "CryptoKnight", supabaseId: "demo-supabase-001", coinBalance: 15000, memberTier: "Gold" },
    { email: "whale@collectors.ae", username: "CRYPTOWHALE", supabaseId: "demo-supabase-002", coinBalance: 50000, memberTier: "Platinum" },
    { email: "zen@collectors.ae", username: "ZenTrader", supabaseId: "demo-supabase-003", coinBalance: 8000, memberTier: "Silver" },
    { email: "sakura@collectors.ae", username: "SakuraCollector", supabaseId: "demo-supabase-004", coinBalance: 3000, memberTier: "Bronze" },
    { email: "admin@collectors.ae", username: "Admin", supabaseId: "demo-supabase-admin", coinBalance: 999999, role: "admin", memberTier: "Platinum" },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    createdUsers.push(user);
  }
  console.log(`✅ ${createdUsers.length} Users created`);

  const [cryptoKnight, cryptoWhale, zenTrader, sakura, admin] = createdUsers;

  // ==========================================
  // 2. Wallets (embedded wallets for NFT users)
  // ==========================================
  const wallets = [
    { userId: cryptoKnight.id, address: "0x1234567890abcdef1234567890abcdef12345678", provider: "thirdweb" },
    { userId: cryptoWhale.id, address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", provider: "thirdweb" },
    { userId: zenTrader.id, address: "0x9876543210fedcba9876543210fedcba98765432", provider: "thirdweb" },
    { userId: sakura.id, address: "0xfedcba0987654321fedcba0987654321fedcba09", provider: "thirdweb" },
  ];

  for (const w of wallets) {
    await prisma.wallet.upsert({
      where: { userId: w.userId },
      update: {},
      create: w,
    });
  }
  console.log("✅ Wallets created");

  // ==========================================
  // 3. Collections (cards pulled by users)
  // ==========================================
  const collections = [];

  // CryptoKnight: 6 cards (mix of rarities)
  for (let i = 0; i < 6; i++) {
    const card = cards[i % cards.length];
    const col = await prisma.collection.create({
      data: {
        userId: cryptoKnight.id,
        cardId: card.id,
        status: "in_collection",
        sellBackValue: Math.floor(card.marketValue * 0.9),
      },
    });
    collections.push({ ...col, card });
  }

  // CRYPTOWHALE: 10 cards
  for (let i = 0; i < 10; i++) {
    const card = cards[(i + 3) % cards.length];
    const col = await prisma.collection.create({
      data: {
        userId: cryptoWhale.id,
        cardId: card.id,
        status: "in_collection",
        sellBackValue: Math.floor(card.marketValue * 0.9),
      },
    });
    collections.push({ ...col, card });
  }

  // ZenTrader: 4 cards
  for (let i = 0; i < 4; i++) {
    const card = cards[(i + 7) % cards.length];
    const col = await prisma.collection.create({
      data: {
        userId: zenTrader.id,
        cardId: card.id,
        status: "in_collection",
        sellBackValue: Math.floor(card.marketValue * 0.9),
      },
    });
    collections.push({ ...col, card });
  }

  // Sakura: 3 cards
  for (let i = 0; i < 3; i++) {
    const card = cards[(i + 12) % cards.length];
    const col = await prisma.collection.create({
      data: {
        userId: sakura.id,
        cardId: card.id,
        status: "in_collection",
        sellBackValue: Math.floor(card.marketValue * 0.9),
      },
    });
    collections.push({ ...col, card });
  }

  console.log(`✅ ${collections.length} Collection items created`);

  // ==========================================
  // 4. Physical Cards (vault custody)
  // ==========================================
  const physicalCards = [];
  for (let i = 0; i < 15; i++) {
    const card = cards[i % cards.length];
    const pc = await prisma.physicalCard.create({
      data: {
        cardId: card.id,
        serialNumber: `CR-2026-${String(i + 1).padStart(4, "0")}`,
        gradeProvider: i % 3 === 0 ? "PSA" : i % 3 === 1 ? "CGC" : "BGS",
        gradeScore: 8.0 + Math.random() * 2,
        condition: "graded",
        vaultLocation: "dubai-main",
        vaultStatus: "in_vault",
      },
    });
    physicalCards.push(pc);
  }
  console.log(`✅ ${physicalCards.length} Physical Cards created`);

  // ==========================================
  // 5. NFTs (minted tokens linked to collections)
  // ==========================================
  const nftContractAddress = "0x0000000000000000000000000000000000000NFT";
  const nfts = [];
  let tokenCounter = 1;

  // Mint NFTs for CryptoKnight's first 4 cards
  for (let i = 0; i < 4; i++) {
    const col = collections[i]; // CryptoKnight's collections
    const nft = await prisma.nft.create({
      data: {
        tokenId: tokenCounter++,
        contractAddress: nftContractAddress,
        chainId: 80002, // Amoy testnet
        metadataUri: `ipfs://QmDemo${String(i + 1).padStart(3, "0")}/metadata.json`,
        imageUri: `ipfs://QmDemo${String(i + 1).padStart(3, "0")}/image.png`,
        cardId: col.card.id,
        ownerId: cryptoKnight.id,
        physicalCardId: physicalCards[i]?.id || null,
        status: "active",
        mintTxHash: `0xdemo_tx_${String(i + 1).padStart(8, "0")}`,
        mintedAt: new Date(Date.now() - (30 - i) * 86400000),
      },
    });
    nfts.push(nft);

    // Link NFT to collection
    await prisma.collection.update({
      where: { id: col.id },
      data: { nftId: nft.id },
    });

    // Record mint transfer
    await prisma.nftTransfer.create({
      data: {
        nftId: nft.id,
        fromId: null,
        toId: cryptoKnight.id,
        type: "mint",
        txHash: nft.mintTxHash,
      },
    });
  }

  // Mint NFTs for CRYPTOWHALE's first 6 cards
  for (let i = 0; i < 6; i++) {
    const col = collections[6 + i]; // CRYPTOWHALE's collections (offset 6)
    const nft = await prisma.nft.create({
      data: {
        tokenId: tokenCounter++,
        contractAddress: nftContractAddress,
        chainId: 80002,
        metadataUri: `ipfs://QmDemo${String(tokenCounter).padStart(3, "0")}/metadata.json`,
        imageUri: `ipfs://QmDemo${String(tokenCounter).padStart(3, "0")}/image.png`,
        cardId: col.card.id,
        ownerId: cryptoWhale.id,
        physicalCardId: physicalCards[4 + i]?.id || null,
        status: i < 5 ? "active" : "listed",
        mintTxHash: `0xdemo_tx_whale_${String(i + 1).padStart(4, "0")}`,
        mintedAt: new Date(Date.now() - (25 - i) * 86400000),
      },
    });
    nfts.push(nft);

    await prisma.collection.update({
      where: { id: col.id },
      data: { nftId: nft.id, status: i < 5 ? "in_collection" : "listed" },
    });

    await prisma.nftTransfer.create({
      data: {
        nftId: nft.id,
        fromId: null,
        toId: cryptoWhale.id,
        type: "mint",
        txHash: nft.mintTxHash,
      },
    });
  }

  // Mint NFTs for ZenTrader's 2 cards
  for (let i = 0; i < 2; i++) {
    const col = collections[16 + i]; // ZenTrader's collections
    const nft = await prisma.nft.create({
      data: {
        tokenId: tokenCounter++,
        contractAddress: nftContractAddress,
        chainId: 80002,
        metadataUri: `ipfs://QmDemoZen${String(i + 1).padStart(3, "0")}/metadata.json`,
        imageUri: `ipfs://QmDemoZen${String(i + 1).padStart(3, "0")}/image.png`,
        cardId: col.card.id,
        ownerId: zenTrader.id,
        physicalCardId: physicalCards[10 + i]?.id || null,
        status: "active",
        mintTxHash: `0xdemo_tx_zen_${String(i + 1).padStart(4, "0")}`,
        mintedAt: new Date(Date.now() - (20 - i) * 86400000),
      },
    });
    nfts.push(nft);

    await prisma.collection.update({
      where: { id: col.id },
      data: { nftId: nft.id },
    });

    await prisma.nftTransfer.create({
      data: {
        nftId: nft.id,
        fromId: null,
        toId: zenTrader.id,
        type: "mint",
        txHash: nft.mintTxHash,
      },
    });
  }

  console.log(`✅ ${nfts.length} NFTs minted`);

  // ==========================================
  // 6. Marketplace Listings
  // ==========================================
  // CRYPTOWHALE lists 1 NFT
  const whaleListedNft = nfts.find((n: any) => n.status === "listed");
  if (whaleListedNft) {
    await prisma.listing.create({
      data: {
        nftId: whaleListedNft.id,
        sellerId: cryptoWhale.id,
        priceCoins: 800,
        priceAed: 29.40,
        status: "active",
      },
    });
  }

  // CryptoKnight lists 1 NFT
  const knightNft = nfts[2]; // 3rd NFT
  await prisma.nft.update({ where: { id: knightNft.id }, data: { status: "listed" } });
  await prisma.listing.create({
    data: {
      nftId: knightNft.id,
      sellerId: cryptoKnight.id,
      priceCoins: 1200,
      priceAed: 44.10,
      status: "active",
    },
  });

  console.log("✅ Marketplace Listings created");

  // ==========================================
  // 7. Offers
  // ==========================================
  if (whaleListedNft) {
    await prisma.offer.create({
      data: {
        nftId: whaleListedNft.id,
        bidderId: zenTrader.id,
        priceCoins: 650,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
  }

  await prisma.offer.create({
    data: {
      nftId: knightNft.id,
      bidderId: sakura.id,
      priceCoins: 1000,
      status: "pending",
      expiresAt: new Date(Date.now() + 5 * 86400000),
    },
  });

  console.log("✅ Offers created");

  // ==========================================
  // 8. Pull History (demo activity)
  // ==========================================
  const packs = await prisma.gachaPack.findMany({ take: 6 });
  for (let i = 0; i < 15; i++) {
    const user = createdUsers[i % 4]; // rotate through non-admin users
    const pack = packs[i % packs.length];
    const card = cards[i % cards.length];
    await prisma.pullHistory.create({
      data: {
        userId: user.id,
        packId: pack.id,
        cardId: card.id,
        coinsSpent: pack.price,
        pulledAt: new Date(Date.now() - (15 - i) * 3600000),
      },
    });
  }
  console.log("✅ Pull History created (15 entries)");

  // ==========================================
  // 9. Coin Transactions (demo ledger)
  // ==========================================
  for (const user of createdUsers.slice(0, 4)) {
    // Initial coin purchase
    await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        type: "purchase",
        amount: user.coinBalance + 5000,
        balanceAfter: user.coinBalance + 5000,
        description: "Initial coin purchase",
      },
    });
    // Some spending
    await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        type: "spend",
        amount: -5000,
        balanceAfter: user.coinBalance,
        description: "Gacha pulls",
      },
    });
  }
  console.log("✅ Coin Transactions created");

  // ==========================================
  // 10. Price History
  // ==========================================
  for (const card of cards.slice(0, 10)) {
    for (let week = 4; week >= 0; week--) {
      const variance = 0.9 + Math.random() * 0.2;
      await prisma.priceHistory.create({
        data: {
          cardId: card.id,
          priceAed: card.marketValue * 0.367 * variance,
          priceCoins: Math.floor(card.marketValue * variance),
          source: "algorithm",
          recordedAt: new Date(Date.now() - week * 7 * 86400000),
        },
      });
    }
  }
  console.log("✅ Price History created");

  console.log("\n🎉 NFT demo seed complete!");
  console.log("📊 Summary:");
  console.log(`   Users: ${createdUsers.length}`);
  console.log(`   Wallets: ${wallets.length}`);
  console.log(`   Collections: ${collections.length}`);
  console.log(`   Physical Cards: ${physicalCards.length}`);
  console.log(`   NFTs: ${nfts.length}`);
  console.log(`   Marketplace Listings: 2`);
  console.log(`   Offers: 2`);
}

main()
  .catch((e) => {
    console.error("❌ NFT seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
