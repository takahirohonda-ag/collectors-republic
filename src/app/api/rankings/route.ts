import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export interface RankingUser {
  rank: number;
  userId: string;
  username: string;
  value: number;
}

export interface RankingsResponse {
  topCollectors: RankingUser[];
  bigSpenders: RankingUser[];
  rareHunters: RankingUser[];
}

// Mock data for fallback when DB is unavailable
const MOCK_RANKINGS: RankingsResponse = {
  topCollectors: [
    { rank: 1, userId: "u1", username: "CardKing_88", value: 342 },
    { rank: 2, userId: "u2", username: "PullMaster", value: 289 },
    { rank: 3, userId: "u3", username: "CollectorPro", value: 245 },
    { rank: 4, userId: "u4", username: "RareHunter99", value: 198 },
    { rank: 5, userId: "u5", username: "PackOpener", value: 175 },
    { rank: 6, userId: "u6", username: "GachaGod", value: 163 },
    { rank: 7, userId: "u7", username: "CardWizard", value: 150 },
    { rank: 8, userId: "u8", username: "PokeFan2026", value: 142 },
    { rank: 9, userId: "u9", username: "DeckBuilder", value: 135 },
    { rank: 10, userId: "u10", username: "LegendSeeker", value: 128 },
  ],
  bigSpenders: [
    { rank: 1, userId: "u1", username: "CardKing_88", value: 125000 },
    { rank: 2, userId: "u3", username: "CollectorPro", value: 98000 },
    { rank: 3, userId: "u5", username: "PackOpener", value: 87500 },
    { rank: 4, userId: "u2", username: "PullMaster", value: 76200 },
    { rank: 5, userId: "u7", username: "CardWizard", value: 65000 },
    { rank: 6, userId: "u9", username: "DeckBuilder", value: 54800 },
    { rank: 7, userId: "u4", username: "RareHunter99", value: 49200 },
    { rank: 8, userId: "u6", username: "GachaGod", value: 43700 },
    { rank: 9, userId: "u8", username: "PokeFan2026", value: 38500 },
    { rank: 10, userId: "u10", username: "LegendSeeker", value: 32100 },
  ],
  rareHunters: [
    { rank: 1, userId: "u4", username: "RareHunter99", value: 28 },
    { rank: 2, userId: "u1", username: "CardKing_88", value: 24 },
    { rank: 3, userId: "u6", username: "GachaGod", value: 19 },
    { rank: 4, userId: "u2", username: "PullMaster", value: 17 },
    { rank: 5, userId: "u10", username: "LegendSeeker", value: 15 },
    { rank: 6, userId: "u3", username: "CollectorPro", value: 12 },
    { rank: 7, userId: "u7", username: "CardWizard", value: 10 },
    { rank: 8, userId: "u5", username: "PackOpener", value: 9 },
    { rank: 9, userId: "u8", username: "PokeFan2026", value: 8 },
    { rank: 10, userId: "u9", username: "DeckBuilder", value: 7 },
  ],
};

/**
 * GET /api/rankings
 * Returns three leaderboards: top collectors, big spenders, rare hunters.
 */
export async function GET() {
  const prisma = getPrisma();

  if (!prisma) {
    return NextResponse.json({ ...MOCK_RANKINGS, isMock: true });
  }

  try {
    const TOP_N = 10;

    // 1. Top Collectors — users with most cards in collection
    const collectionCounts = await prisma.collection.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: TOP_N,
    });

    const collectorUserIds = collectionCounts.map((r: { userId: string; _count: { id: number } }) => r.userId);
    const collectorUsers = await prisma.user.findMany({
      where: { id: { in: collectorUserIds } },
      select: { id: true, username: true },
    });
    type UserRow = { id: string; username: string };
    type GroupByCount = { userId: string; _count: { id: number } };
    type GroupBySum = { userId: string; _sum: { coinsSpent: number | null } };

    const collectorUserMap = new Map<string, string>(collectorUsers.map((u: UserRow) => [u.id, String(u.username)]));

    const topCollectors: RankingUser[] = (collectionCounts as GroupByCount[]).map((row, idx) => ({
      rank: idx + 1,
      userId: row.userId,
      username: collectorUserMap.get(row.userId) ?? "Unknown",
      value: row._count.id,
    }));

    // 2. Big Spenders — users by total coins spent in pull history
    const spendAggregates = await prisma.pullHistory.groupBy({
      by: ["userId"],
      _sum: { coinsSpent: true },
      orderBy: { _sum: { coinsSpent: "desc" } },
      take: TOP_N,
    });

    const spenderUserIds = (spendAggregates as GroupBySum[]).map((r) => r.userId);
    const spenderUsers = await prisma.user.findMany({
      where: { id: { in: spenderUserIds } },
      select: { id: true, username: true },
    });
    const spenderUserMap = new Map<string, string>(spenderUsers.map((u: UserRow) => [u.id, String(u.username)]));

    const bigSpenders: RankingUser[] = (spendAggregates as GroupBySum[]).map((row, idx) => ({
      rank: idx + 1,
      userId: row.userId,
      username: spenderUserMap.get(row.userId) ?? "Unknown",
      value: row._sum.coinsSpent ?? 0,
    }));

    // 3. Rare Hunters — users with most tier4 cards in collection
    const tier4Counts = await prisma.collection.groupBy({
      by: ["userId"],
      where: {
        card: { rarity: "tier4" },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: TOP_N,
    });

    const rareUserIds = (tier4Counts as GroupByCount[]).map((r) => r.userId);
    const rareUsers = await prisma.user.findMany({
      where: { id: { in: rareUserIds } },
      select: { id: true, username: true },
    });
    const rareUserMap = new Map<string, string>(rareUsers.map((u: UserRow) => [u.id, String(u.username)]));

    const rareHunters: RankingUser[] = (tier4Counts as GroupByCount[]).map((row, idx) => ({
      rank: idx + 1,
      userId: row.userId,
      username: rareUserMap.get(row.userId) ?? "Unknown",
      value: row._count.id,
    }));

    return NextResponse.json({ topCollectors, bigSpenders, rareHunters, isMock: false });
  } catch (error) {
    console.error("Rankings API error:", error);
    return NextResponse.json({ ...MOCK_RANKINGS, isMock: true });
  }
}
