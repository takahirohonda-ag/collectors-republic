"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

const mockCards = [
  { id: "c1", name: "Pikachu VMAX", series: "Pokemon", rarity: "Tier 1", marketValue: 45, stock: 12 },
  { id: "c2", name: "Charizard GX", series: "Pokemon", rarity: "Tier 2", marketValue: 85, stock: 8 },
  { id: "c3", name: "Rayquaza V Alt Art", series: "Pokemon", rarity: "Tier 3", marketValue: 180, stock: 3 },
  { id: "c4", name: "Umbreon VMAX Alt Art", series: "Pokemon", rarity: "Tier 4", marketValue: 450, stock: 1 },
  { id: "c5", name: "Mewtwo GX", series: "Pokemon", rarity: "Tier 1", marketValue: 35, stock: 15 },
  { id: "c6", name: "Lugia V Alt Art", series: "Pokemon", rarity: "Tier 3", marketValue: 220, stock: 2 },
];

export default function AdminCardsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = mockCards.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.series.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Card Master</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add Card
        </Button>
      </div>

      {/* Add Card Form */}
      {showForm && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">New Card</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Card Name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            <input placeholder="Series" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none">
              <option>Tier 1</option><option>Tier 2</option><option>Tier 3</option><option>Tier 4</option>
            </select>
            <input placeholder="Market Value ($)" type="number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            <input placeholder="Stock" type="number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
            <input placeholder="Image URL" className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <Button size="sm">Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cards..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="text-left text-xs text-muted">
              <th className="p-3">Name</th>
              <th className="p-3 hidden md:table-cell">Series</th>
              <th className="p-3">Rarity</th>
              <th className="p-3">Value</th>
              <th className="p-3 hidden md:table-cell">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((card) => (
              <tr key={card.id} className="hover:bg-card/50">
                <td className="p-3 text-sm font-medium">{card.name}</td>
                <td className="p-3 text-sm text-muted hidden md:table-cell">{card.series}</td>
                <td className="p-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 ${
                    card.rarity === "Tier 1" ? "bg-green-500/20 text-green-400" :
                    card.rarity === "Tier 2" ? "bg-blue-500/20 text-blue-400" :
                    card.rarity === "Tier 3" ? "bg-purple-500/20 text-purple-400" :
                    "bg-amber-500/20 text-amber-400"
                  }`}>{card.rarity}</span>
                </td>
                <td className="p-3 text-sm">{formatCurrency(card.marketValue)}</td>
                <td className="p-3 text-sm text-muted hidden md:table-cell">{card.stock}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button className="rounded p-1 hover:bg-card-hover"><Edit className="h-3.5 w-3.5 text-muted" /></button>
                    <button className="rounded p-1 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
