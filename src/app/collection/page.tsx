"use client";

import { useState } from "react";
import { mockCollection } from "@/data/mock";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "in_collection" | "shipping" | "shipped" | "sold_back";
type SortBy = "recent" | "value_high" | "value_low";

const statusLabels: Record<string, string> = {
  all: "Select All",
  in_collection: "In Collection",
  shipping: "Shipping",
  shipped: "Shipped",
  sold_back: "Sold Back",
};

export default function CollectionPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  const filtered = statusFilter === "all"
    ? mockCollection
    : mockCollection.filter((item) => item.status === statusFilter);

  const totalValue = filtered.reduce((sum, item) => sum + item.card.marketValue, 0);

  const toggleCard = (id: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTotal = filtered
    .filter((item) => selectedCards.has(item.id))
    .reduce((sum, item) => sum + item.sellBackValue, 0);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">My Collection</h1>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button className="flex items-center gap-1 rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-muted">
          <Filter className="h-3 w-3" />
          Status
          <ChevronDown className="h-3 w-3" />
        </button>
        <button className="flex items-center gap-1 rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-muted">
          Category
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item) => {
          const isSelected = selectedCards.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleCard(item.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                isSelected
                  ? "border-red-500 bg-red-500/5"
                  : "border-border bg-card hover:bg-card-hover"
              )}
            >
              {/* Status badge */}
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    item.status === "in_collection" && "bg-green-500/20 text-green-400",
                    item.status === "shipping" && "bg-blue-500/20 text-blue-400",
                    item.status === "shipped" && "bg-purple-500/20 text-purple-400",
                    item.status === "sold_back" && "bg-gray-500/20 text-gray-400"
                  )}
                >
                  {statusLabels[item.status]}
                </span>
                {isSelected && (
                  <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                )}
              </div>

              {/* Card image */}
              <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-amber-500/10 to-purple-500/10 mb-2 flex items-center justify-center">
                <span className="text-3xl">🃏</span>
              </div>

              <p className="text-xs font-medium truncate">{item.card.name}</p>
              <p className="text-[10px] text-amber-400 font-medium">
                {formatCurrency(item.card.marketValue)}
              </p>
              <p className="text-[10px] text-muted">
                Pulled on {item.acquiredAt.toLocaleDateString()}
              </p>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="h-24" />

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-xl p-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">
              Total Value: <span className="text-foreground font-bold">{formatCurrency(totalValue)} 🔥</span>
            </span>
            {selectedCards.size > 0 && (
              <span className="text-xs text-muted">
                Selected: {selectedCards.size} cards ({formatCurrency(selectedTotal)})
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={selectedCards.size === 0}
            >
              SELL BACK
            </Button>
            <Button
              className="flex-1"
              disabled={selectedCards.size === 0}
            >
              🚚 SHIP NOW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
