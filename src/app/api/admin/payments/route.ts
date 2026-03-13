import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_PAYMENTS = [
  { id: "p1", user: "CryptoKnight", provider: "stripe", amount: 3700, currency: "AED", amountAed: 3700, coinsGranted: 1200, status: "completed", createdAt: "2026-03-13T10:00:00Z" },
  { id: "p2", user: "ZenTrader", provider: "stripe", amount: 9900, currency: "AED", amountAed: 9900, coinsGranted: 3500, status: "completed", createdAt: "2026-03-13T09:30:00Z" },
  { id: "p3", user: "CRYPTOWHALE", provider: "stripe", amount: 2500, currency: "USD", amountAed: 9188, coinsGranted: 10000, status: "completed", createdAt: "2026-03-12T15:00:00Z" },
  { id: "p4", user: "CardMaster99", provider: "stripe", amount: 3700, currency: "AED", amountAed: 3700, coinsGranted: 1200, status: "completed", createdAt: "2026-03-12T12:00:00Z" },
  { id: "p5", user: "NewCollector", provider: "stripe", amount: 1900, currency: "AED", amountAed: 1900, coinsGranted: 500, status: "completed", createdAt: "2026-03-11T18:00:00Z" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const currency = searchParams.get("currency");
  const limit = Number(searchParams.get("limit") || "50");

  const prisma = getPrisma();
  if (!prisma) {
    let filtered = MOCK_PAYMENTS;
    if (provider && provider !== "all") filtered = filtered.filter((p) => p.provider === provider);
    if (currency && currency !== "all") filtered = filtered.filter((p) => p.currency === currency);
    return NextResponse.json({ payments: filtered, isDbConnected: false });
  }

  try {
    const where: Record<string, unknown> = { status: "completed" };
    if (provider && provider !== "all") where.provider = provider;
    if (currency && currency !== "all") where.currency = currency;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { username: true } } },
    });

    const result = payments.map((p: { id: string; user: { username: string }; provider: string; amount: number; currency: string; amountAed: number; coinsGranted: number; status: string; createdAt: Date }) => ({
      id: p.id,
      user: p.user.username,
      provider: p.provider,
      amount: p.amount,
      currency: p.currency,
      amountAed: p.amountAed,
      coinsGranted: p.coinsGranted,
      status: p.status,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ payments: result, isDbConnected: true });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json({ payments: MOCK_PAYMENTS, isDbConnected: false });
  }
}
