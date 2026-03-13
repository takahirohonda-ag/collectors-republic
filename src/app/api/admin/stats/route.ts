import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_STATS = {
  totalRevenue: 12450,
  totalUsers: 1234,
  packsOpened: 8921,
  pendingShipments: 3,
  recentActivity: [
    { user: "CryptoKnight", action: "Opened Pokemon Elite Pack", time: "2m ago", amount: "+500 coins" },
    { user: "ZenTrader", action: "Purchased 1,000 coins", time: "5m ago", amount: "AED 37" },
    { user: "CRYPTOWHALE", action: "Sold back Charizard GX", time: "8m ago", amount: "68 coins" },
    { user: "CardMaster99", action: "Requested shipping", time: "12m ago", amount: "2 cards" },
    { user: "NewCollector", action: "Signed up", time: "15m ago", amount: "" },
  ],
};

export async function GET() {
  const prisma = getPrisma();

  if (!prisma) {
    return NextResponse.json({ ...MOCK_STATS, isDbConnected: false });
  }

  try {
    const [totalUsers, packsOpened, pendingShipments, revenueResult, recentTx] = await Promise.all([
      prisma.user.count(),
      prisma.pullHistory.count(),
      prisma.shippingOrder.count({ where: { status: "pending" } }),
      prisma.coinTransaction.aggregate({
        where: { type: "purchase" },
        _sum: { amount: true },
      }),
      prisma.coinTransaction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
    ]);

    const recentActivity = recentTx.map((tx: { user: { username: string }; type: string; amount: number; createdAt: Date; description: string | null }) => ({
      user: tx.user.username,
      action: tx.description || tx.type,
      time: timeAgo(tx.createdAt),
      amount: `${tx.amount > 0 ? "+" : ""}${tx.amount} coins`,
    }));

    return NextResponse.json({
      totalRevenue: revenueResult._sum.amount || 0,
      totalUsers,
      packsOpened,
      pendingShipments,
      recentActivity,
      isDbConnected: true,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ ...MOCK_STATS, isDbConnected: false });
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
