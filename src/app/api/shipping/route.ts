import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

/**
 * GET /api/shipping
 * Returns the current authenticated user's shipping orders with their items.
 * Falls back to empty array if DB is not connected or user is not authenticated.
 */
export async function GET() {
  const authUser = await getCurrentUser();
  const prisma = getPrisma();

  if (!authUser || !prisma) {
    return NextResponse.json({ orders: [], isDbConnected: !!prisma });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ orders: [], isDbConnected: true });
    }

    const orders = await prisma.shippingOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            collection: {
              include: { card: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ orders, isDbConnected: true });
  } catch (error) {
    console.error("Shipping GET error:", error);
    return NextResponse.json({ orders: [], isDbConnected: false });
  }
}
