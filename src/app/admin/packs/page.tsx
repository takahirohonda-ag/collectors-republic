"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Plus, Edit, Settings } from "lucide-react";
import { PackTier } from "@/types";

const mockPacks = [
  { id: "1", name: "Pokemon Basic Pack", tier: "basic" as PackTier, price: 100, expectedValue: 50, sold: 3245, active: true },
  { id: "2", name: "Pokemon Elite Pack", tier: "elite" as PackTier, price: 500, expectedValue: 280, sold: 1021, active: true },
  { id: "3", name: "Pokemon Legendary Pack", tier: "legendary" as PackTier, price: 2000, expectedValue: 1200, sold: 312, active: true },
];

export default function AdminPacksPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pack Management</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add Pack
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">New Pack</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Pack Name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none">
              <option value="basic">Basic</option><option value="elite">Elite</option><option value="legendary">Legendary</option>
            </select>
            <input placeholder="Price (coins)" type="number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            <input placeholder="Expected Value ($)" type="number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <Button size="sm">Create Pack</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {mockPacks.map((pack) => (
          <div key={pack.id} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📦</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{pack.name}</h3>
                    <TierBadge tier={pack.tier} />
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {formatNumber(pack.price)} coins &middot; EV {formatCurrency(pack.expectedValue)} &middot; {formatNumber(pack.sold)} sold
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${pack.active ? "bg-green-400" : "bg-red-400"}`} />
                <button className="rounded p-1.5 hover:bg-card-hover"><Settings className="h-4 w-4 text-muted" /></button>
                <button className="rounded p-1.5 hover:bg-card-hover"><Edit className="h-4 w-4 text-muted" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
