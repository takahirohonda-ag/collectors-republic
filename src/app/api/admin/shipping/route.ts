import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const MOCK_SHIPMENTS = [
  { id: "s1", user: "CryptoKnight", cards: ["Pikachu VMAX", "Mewtwo GX"], status: "pending", requestDate: "2026-03-12", address: "Dubai, UAE", trackingNo: null, carrier: null },
  { id: "s2", user: "CRYPTOWHALE", cards: ["Umbreon VMAX"], status: "shipped", requestDate: "2026-03-10", address: "Abu Dhabi, UAE", trackingNo: "UAE123456", carrier: "fedex" },
  { id: "s3", user: "ZenTrader", cards: ["Charizard GX", "Rayquaza V"], status: "delivered", requestDate: "2026-03-05", address: "Riyadh, SA", trackingNo: "SA789012", carrier: "aramex" },
];

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ shipments: MOCK_SHIPMENTS, isDbConnected: false });
  }

  try {
    const orders = await prisma.shippingOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { username: true } },
        items: { include: { collection: { include: { card: true } } } },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shipments = orders.map((o: any) => ({
      id: o.id,
      user: o.user.username,
      cards: o.items.map((i: any) => i.collection.card.name),
      status: o.status,
      requestDate: o.createdAt.toISOString().split("T")[0],
      address: `${(o.addressJson as { city?: string; country?: string })?.city || ""}, ${(o.addressJson as { city?: string; country?: string })?.country || ""}`,
      trackingNo: o.trackingNumber,
      carrier: o.carrier,
    }));

    return NextResponse.json({ shipments, isDbConnected: true });
  } catch (error) {
    console.error("Admin shipping error:", error);
    return NextResponse.json({ shipments: MOCK_SHIPMENTS, isDbConnected: false });
  }
}

/**
 * PATCH /api/admin/shipping — Update shipping status or tracking number
 * Body: { orderId, status?, trackingNumber? }
 */
export async function PATCH(request: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ success: true, message: "Mock mode" });
  }

  try {
    const { orderId, status, trackingNumber, carrier } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;

    const order = await prisma.shippingOrder.update({
      where: { id: orderId },
      data: updateData,
    });

    // When shipped, update all collection items to "shipping" status
    if (status === "shipped") {
      const items = await prisma.shippingItem.findMany({ where: { orderId } });
      await Promise.all(
        items.map((item: { collectionId: string }) =>
          prisma.collection.update({
            where: { id: item.collectionId },
            data: { status: "shipping" },
          })
        )
      );
    }

    // When delivered, update all collection items to "shipped" status
    if (status === "delivered") {
      const items = await prisma.shippingItem.findMany({ where: { orderId } });
      await Promise.all(
        items.map((item: { collectionId: string }) =>
          prisma.collection.update({
            where: { id: item.collectionId },
            data: { status: "shipped" },
          })
        )
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Admin shipping update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
