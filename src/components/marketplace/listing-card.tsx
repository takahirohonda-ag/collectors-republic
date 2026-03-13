"use client";

import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { CardImage } from "@/components/ui/card-image";
import { NftBadge } from "@/components/nft/nft-badge";
import { Coins, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardRarity } from "@/types";

interface ListingCardProps {
  id: string;
  cardName: string;
  cardImageUrl: string;
  cardRarity: CardRarity;
  series: string;
  priceCoins: number;
  marketValue: number;
  sellerName: string;
  gradeProvider?: string;
  gradeScore?: number;
}

export function ListingCard({
  id,
  cardName,
  cardImageUrl,
  cardRarity,
  series,
  priceCoins,
  marketValue,
  sellerName,
  gradeProvider,
  gradeScore,
}: ListingCardProps) {
  const discount = marketValue > 0 ? Math.round(((marketValue - priceCoins) / marketValue) * 100) : 0;

  return (
    <Link
      href={`/marketplace/${id}`}
      className="rounded-xl border border-border bg-card hover:bg-card-hover transition-all p-3 block group"
    >
      {/* NFT indicator */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          <Hexagon className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] text-purple-400 font-medium">NFT</span>
        </div>
        {discount > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
            -{discount}%
          </span>
        )}
      </div>

      {/* Card Image */}
      <div className="relative aspect-[3/4] rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 mb-2 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent" />
        <CardImage src={cardImageUrl} alt={cardName} rarity={cardRarity} size="md" />
      </div>

      {/* Info */}
      <p className="text-xs font-medium truncate">{cardName}</p>
      <p className="text-[10px] text-muted">{series}</p>
      {gradeProvider && gradeScore && (
        <p className="text-[10px] text-blue-400">{gradeProvider} {gradeScore}</p>
      )}

      {/* Price */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <Coins className="h-3 w-3 text-amber-400" />
          <span className="text-sm font-bold text-amber-400">{formatNumber(priceCoins)}</span>
        </div>
        <span className="text-[10px] text-muted">by {sellerName}</span>
      </div>
    </Link>
  );
}
