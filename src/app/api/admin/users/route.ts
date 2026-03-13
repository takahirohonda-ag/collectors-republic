import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_USERS = [
  { id: "u1", username: "CryptoKnight", email: "crypto@example.com", joinDate: "2026-01-15", coinBalance: 2450, packsOpened: 48, status: "active" },
  { id: "u2", username: "ZenTrader", email: "zen@example.com", joinDate: "2026-02-01", coinBalance: 1200, packsOpened: 22, status: "active" },
  { id: "u3", username: "CRYPTOWHALE", email: "whale@example.com", joinDate: "2026-01-05", coinBalance: 8900, packsOpened: 156, status: "active" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const prisma = getPrisma();
  if (!prisma) {
    const filtered = MOCK_USERS.filter(
      (u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );
    return NextResponse.json({ users: filtered, isDbConnected: false });
  }

  try {
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: { select: { pullHistory: true } },
      },
    });

    const result = users.map((u: { id: string; username: string; email: string; createdAt: Date; coinBalance: number; _count: { pullHistory: number } }) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      joinDate: u.createdAt.toISOString().split("T")[0],
      coinBalance: u.coinBalance,
      packsOpened: u._count.pullHistory,
      status: "active",
    }));

    return NextResponse.json({ users: result, isDbConnected: true });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ users: MOCK_USERS, isDbConnected: false });
  }
}
