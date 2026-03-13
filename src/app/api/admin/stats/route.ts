import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_STATS = {
  totalRevenueAed: 45850, // in fils → AED 458.50
  totalUsers: 1234,
  packsOpened: 8921,
  pendingShipments: 3,
  revenueByProvider: [
    { provider: "stripe", totalAed: 45850, count: 42 },
  ],
  revenueByCurrency: [
    { currency: "AED", total: 45850, totalAed: 45850, count: 42 },
  ],
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
    const [totalUsers, packsOpened, pendingShipments, recentTx] = await Promise.all([
      prisma.user.count(),
      prisma.pullHistory.count(),
      prisma.shippingOrder.count({ where: { status: "pending" } }),
      prisma.coinTransaction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
    ]);

    // Revenue from payments table (real money)
    const revenueAgg = await prisma.payment.aggregate({
      where: { status: "completed" },
      _sum: { amountAed: true },
    });

    // Revenue by provider
    const paymentsByProvider = await prisma.payment.groupBy({
      by: ["provider"],
      where: { status: "completed" },
      _sum: { amountAed: true },
      _count: true,
    });

    // Revenue by currency
    const paymentsByCurrency = await prisma.payment.groupBy({
      by: ["currency"],
      where: { status: "completed" },
      _sum: { amount: true, amountAed: true },
      _count: true,
    });

    const recentActivity = recentTx.map((tx: { user: { username: string }; type: string; amount: number; createdAt: Date; description: string | null }) => ({
      user: tx.user.username,
      action: tx.description || tx.type,
      time: timeAgo(tx.createdAt),
      amount: `${tx.amount > 0 ? "+" : ""}${tx.amount} coins`,
    }));

    return NextResponse.json({
      totalRevenueAed: revenueAgg._sum.amountAed || 0,
      totalUsers,
      packsOpened,
      pendingShipments,
      revenueByProvider: paymentsByProvider.map((p: { provider: string; _sum: { amountAed: number | null }; _count: number }) => ({
        provider: p.provider,
        totalAed: p._sum.amountAed || 0,
        count: p._count,
      })),
      revenueByCurrency: paymentsByCurrency.map((p: { currency: string; _sum: { amount: number | null; amountAed: number | null }; _count: number }) => ({
        currency: p.currency,
        total: p._sum.amount || 0,
        totalAed: p._sum.amountAed || 0,
        count: p._count,
      })),
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
