import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
}

/**
 * POST /api/shipping/request
 * Create a shipping order for one or more collection items.
 * Body: { collectionIds: string[], address: ShippingAddress }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    const prisma = getPrisma();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      // Mock mode — no DB connected
      return NextResponse.json({
        success: true,
        order: {
          id: "mock-order-id",
          status: "pending",
          addressJson: {},
          createdAt: new Date().toISOString(),
          items: [],
        },
        message: "Mock mode — connect DB for real shipping requests",
      });
    }

    const body = await request.json();
    const { collectionIds, address } = body as {
      collectionIds?: string[];
      address?: ShippingAddress;
    };

    // Validate input
    if (!collectionIds || !Array.isArray(collectionIds) || collectionIds.length === 0) {
      return NextResponse.json({ error: "collectionIds array is required" }, { status: 400 });
    }

    if (!address || !address.street || !address.city || !address.country || !address.postalCode || !address.phone) {
      return NextResponse.json(
        { error: "address with street, city, country, postalCode, and phone is required" },
        { status: 400 }
      );
    }

    // Resolve internal user from supabaseId
    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Validate all collectionIds belong to this user and have status "in_collection"
    const items = await prisma.collection.findMany({
      where: {
        id: { in: collectionIds },
        userId: user.id,
        status: "in_collection",
      },
      include: { card: true },
    });

    if (items.length !== collectionIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more collection items are invalid, do not belong to you, or are not in 'in_collection' status",
        },
        { status: 400 }
      );
    }

    // Step 1: Create the ShippingOrder first to get its id
    const order = await prisma.shippingOrder.create({
      data: {
        userId: user.id,
        status: "pending",
        addressJson: address as any,
      },
    });

    // Step 2: Create ShippingItem records + update collection statuses atomically
    await prisma.$transaction([
      prisma.shippingItem.createMany({
        data: collectionIds.map((collectionId: string) => ({
          orderId: order.id,
          collectionId,
        })),
      }),
      prisma.collection.updateMany({
        where: { id: { in: collectionIds } },
        data: { status: "shipping" },
      }),
    ]);

    // Fetch the fully populated order to return
    const populatedOrder = await prisma.shippingOrder.findUnique({
      where: { id: order.id },
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

    return NextResponse.json({ success: true, order: populatedOrder }, { status: 201 });
  } catch (error) {
    console.error("Shipping request error:", error);
    return NextResponse.json({ error: "Failed to create shipping request" }, { status: 500 });
  }
}
