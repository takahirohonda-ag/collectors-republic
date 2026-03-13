"use client";

import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Clock, Truck } from "lucide-react";

const mockShipments = [
  { id: "s1", user: "CryptoKnight", cards: ["Pikachu VMAX", "Mewtwo GX"], status: "pending", requestDate: "2026-03-12", address: "Dubai, UAE" },
  { id: "s2", user: "CRYPTOWHALE", cards: ["Umbreon VMAX Alt Art"], status: "shipped", requestDate: "2026-03-10", address: "Abu Dhabi, UAE", trackingNo: "UAE123456" },
  { id: "s3", user: "ZenTrader", cards: ["Charizard GX", "Rayquaza V Alt Art"], status: "delivered", requestDate: "2026-03-05", address: "Riyadh, SA" },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-400 bg-amber-500/10", label: "Pending" },
  shipped: { icon: Truck, color: "text-blue-400 bg-blue-500/10", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-400 bg-green-500/10", label: "Delivered" },
};

export default function AdminShippingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Shipping Management</h1>
        <div className="flex gap-2">
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400 font-medium">
            {mockShipments.filter((s) => s.status === "pending").length} pending
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {mockShipments.map((shipment) => {
          const config = statusConfig[shipment.status];
          return (
            <div key={shipment.id} className="rounded-xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{shipment.user}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.color}`}>
                    <config.icon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
                <span className="text-xs text-muted">{shipment.requestDate}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {shipment.cards.map((card, i) => (
                  <span key={i} className="rounded-md bg-background px-2 py-1 text-xs">
                    🃏 {card}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">📍 {shipment.address}</span>
                {shipment.status === "pending" && (
                  <Button size="sm">Mark as Shipped</Button>
                )}
                {shipment.status === "shipped" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Tracking: {shipment.trackingNo}</span>
                    <Button size="sm" variant="secondary">Edit</Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
