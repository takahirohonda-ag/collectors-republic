"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Truck, Database } from "lucide-react";

interface Shipment {
  id: string;
  user: string;
  cards: string[];
  status: string;
  requestDate: string;
  address: string;
  trackingNo: string | null;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-400 bg-amber-500/10", label: "Pending" },
  processing: { icon: Truck, color: "text-blue-400 bg-blue-500/10", label: "Processing" },
  shipped: { icon: Truck, color: "text-blue-400 bg-blue-500/10", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-400 bg-green-500/10", label: "Delivered" },
};

export default function AdminShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/shipping")
      .then((r) => r.json())
      .then((data) => {
        setShipments(data.shipments);
        setIsDbConnected(data.isDbConnected);
      });
  }, []);

  const updateShipment = async (orderId: string, status: string, trackingNumber?: string) => {
    setUpdating(orderId);
    await fetch("/api/admin/shipping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, trackingNumber }),
    });

    setShipments((prev) =>
      prev.map((s) =>
        s.id === orderId
          ? { ...s, status, trackingNo: trackingNumber || s.trackingNo }
          : s
      )
    );
    setUpdating(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Shipping Management</h1>
        <div className="flex gap-2">
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400 font-medium">
            {shipments.filter((s) => s.status === "pending").length} pending
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${isDbConnected ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
            <Database className="h-3 w-3" />
            {isDbConnected ? "Live" : "Mock"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {shipments.map((shipment) => {
          const config = statusConfig[shipment.status] || statusConfig.pending;
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

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">📍 {shipment.address}</span>

                {shipment.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Tracking #"
                      value={trackingInputs[shipment.id] || ""}
                      onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [shipment.id]: e.target.value }))}
                      className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:border-red-500 focus:outline-none"
                    />
                    <Button
                      size="sm"
                      disabled={updating === shipment.id}
                      onClick={() => updateShipment(shipment.id, "shipped", trackingInputs[shipment.id])}
                    >
                      {updating === shipment.id ? "..." : "Mark Shipped"}
                    </Button>
                  </div>
                )}

                {shipment.status === "shipped" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">📦 {shipment.trackingNo}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={updating === shipment.id}
                      onClick={() => updateShipment(shipment.id, "delivered")}
                    >
                      {updating === shipment.id ? "..." : "Mark Delivered"}
                    </Button>
                  </div>
                )}

                {shipment.status === "delivered" && (
                  <span className="text-xs text-green-400">✓ Delivered</span>
                )}
              </div>
            </div>
          );
        })}

        {shipments.length === 0 && (
          <p className="text-center text-sm text-muted py-8">No shipping orders yet</p>
        )}
      </div>
    </div>
  );
}
