"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardImage } from "@/components/ui/card-image";
import { Filter, ChevronDown, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/user-context";

type StatusFilter = "all" | "in_collection" | "shipping" | "shipped" | "sold_back";

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
  const [showSoldMessage, setShowSoldMessage] = useState(false);
  const { collection, sellBackCards } = useUser();

  const filtered = statusFilter === "all"
    ? collection
    : collection.filter((item) => item.status === statusFilter);

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

  const handleSellBack = () => {
    const cardIds = Array.from(selectedCards);
    const refund = sellBackCards(cardIds);
    setSelectedCards(new Set());
    if (refund > 0) {
      setShowSoldMessage(true);
      setTimeout(() => setShowSoldMessage(false), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">My Collection</h1>

      {/* Sold notification */}
      {showSoldMessage && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-center">
          <p className="text-sm text-green-400 font-medium">Cards sold back! Coins have been added to your balance.</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(["all", "in_collection", "sold_back"] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              statusFilter === status
                ? "bg-red-500 text-white"
                : "bg-card border border-border text-muted hover:text-foreground"
            )}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No cards here yet. Open some packs!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => {
            const isSelected = selectedCards.has(item.id);
            const canSelect = item.status === "in_collection";
            return (
              <button
                key={item.id}
                onClick={() => canSelect && toggleCard(item.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  isSelected
                    ? "border-red-500 bg-red-500/5"
                    : "border-border bg-card hover:bg-card-hover",
                  !canSelect && "opacity-60"
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
                <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 mb-2 flex items-center justify-center overflow-hidden">
                  <CardImage src={item.card.imageUrl} alt={item.card.name} rarity={item.card.rarity} size="md" />
                </div>

                <p className="text-xs font-medium truncate">{item.card.name}</p>
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-medium">
                    {formatNumber(item.card.marketValue)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Spacer */}
      <div className="h-24" />

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-xl p-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">
              {filtered.length} cards
            </span>
            {selectedCards.size > 0 && (
              <span className="text-xs text-green-400 font-medium">
                Sell back: +{formatNumber(selectedTotal)} coins
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={selectedCards.size === 0}
              onClick={handleSellBack}
            >
              SELL BACK ({selectedCards.size})
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
