import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

/**
 * GET /api/user — returns current user's profile and balance.
 * Falls back to mock data if DB is not connected.
 */
export async function GET() {
  const authUser = await getCurrentUser();

  const prisma = getPrisma();
  if (!prisma || !authUser) {
    // Mock fallback
    return NextResponse.json({
      id: "mock-user-1",
      username: authUser?.username || "CardCollector_99",
      email: authUser?.email || "collector@example.com",
      coinBalance: 12500,
      pointBalance: 1500,
      memberTier: "Silver",
      isDbConnected: false,
    });
  }

  try {
    // Find or create user in DB
    let user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          supabaseId: authUser.id,
          email: authUser.email,
          username: authUser.username,
          coinBalance: 1000, // Welcome bonus
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      coinBalance: user.coinBalance,
      pointBalance: user.pointBalance,
      memberTier: user.memberTier,
      isDbConnected: true,
    });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({
      id: "mock-user-1",
      username: authUser.username,
      email: authUser.email,
      coinBalance: 12500,
      pointBalance: 1500,
      memberTier: "Silver",
      isDbConnected: false,
    });
  }
}
