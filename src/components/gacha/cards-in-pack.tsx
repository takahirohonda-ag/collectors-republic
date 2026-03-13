"use client";

import { Card, CardRarity } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CardsInPackProps {
  cards: Card[];
}

const rarityTabs: { value: CardRarity | "all"; label: string; color: string }[] = [
  { value: "tier1", label: "Tier1", color: "bg-green-500" },
  { value: "tier2", label: "Tier2", color: "bg-blue-500" },
  { value: "tier3", label: "Tier3", color: "bg-purple-500" },
  { value: "tier4", label: "Tier4", color: "bg-amber-500" },
];

export function CardsInPack({ cards }: CardsInPackProps) {
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | "all">("tier1");

  const filtered = selectedRarity === "all"
    ? cards
    : cards.filter((c) => c.rarity === selectedRarity);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Cards Inside the Gacha Machine
        </h3>
        <button className="text-xs text-muted hover:text-foreground transition-colors">
          See all &gt;
        </button>
      </div>

      {/* Rarity tabs */}
      <div className="flex gap-1.5">
        {rarityTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedRarity(tab.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
              selectedRarity === tab.value
                ? `${tab.color} text-white`
                : "bg-card text-muted border border-border hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((card) => (
          <div
            key={card.id}
            className="rounded-lg bg-card border border-border p-2 transition-all hover:bg-card-hover hover:scale-[1.02]"
          >
            <div className="aspect-[3/4] rounded-md bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-2 flex items-center justify-center">
              <span className="text-3xl">🃏</span>
            </div>
            <p className="text-xs font-medium text-foreground truncate">
              {card.name}
            </p>
            <p className="text-[10px] text-muted">
              {formatCurrency(card.marketValue)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
