import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_TRANSACTIONS = [
  { id: "t1", user: "CryptoKnight", type: "purchase", amount: 1200, description: "Purchased 1,200 coins", createdAt: "2026-03-13T10:00:00Z" },
  { id: "t2", user: "ZenTrader", type: "spend", amount: -100, description: "Opened Pokemon Basic Pack", createdAt: "2026-03-13T09:45:00Z" },
  { id: "t3", user: "CRYPTOWHALE", type: "sell_back", amount: 68, description: "Sold back 1 card(s)", createdAt: "2026-03-13T09:30:00Z" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // purchase, spend, sell_back, all
  const limit = Number(searchParams.get("limit") || "50");

  const prisma = getPrisma();
  if (!prisma) {
    const filtered = type && type !== "all"
      ? MOCK_TRANSACTIONS.filter((t) => t.type === type)
      : MOCK_TRANSACTIONS;
    return NextResponse.json({ transactions: filtered, isDbConnected: false });
  }

  try {
    const transactions = await prisma.coinTransaction.findMany({
      where: type && type !== "all" ? { type } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { username: true, email: true } } },
    });

    const result = transactions.map((tx: { id: string; user: { username: string }; type: string; amount: number; description: string | null; stripePaymentId: string | null; createdAt: Date }) => ({
      id: tx.id,
      user: tx.user.username,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      stripePaymentId: tx.stripePaymentId,
      createdAt: tx.createdAt,
    }));

    return NextResponse.json({ transactions: result, isDbConnected: true });
  } catch (error) {
    console.error("Admin transactions error:", error);
    return NextResponse.json({ transactions: MOCK_TRANSACTIONS, isDbConnected: false });
  }
}
