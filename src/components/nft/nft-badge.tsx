"use client";

import { cn } from "@/lib/utils";
import type { NftStatus } from "@/types";

const statusConfig: Record<NftStatus, { label: string; color: string }> = {
  minting: { label: "Minting...", color: "bg-yellow-500/20 text-yellow-400 animate-pulse" },
  active: { label: "NFT", color: "bg-purple-500/20 text-purple-400" },
  listed: { label: "Listed", color: "bg-blue-500/20 text-blue-400" },
  redeemed: { label: "Redeemed", color: "bg-green-500/20 text-green-400" },
  burned: { label: "Burned", color: "bg-gray-500/20 text-gray-400" },
};

export function NftBadge({ status, className }: { status: NftStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", config.color, className)}>
      {config.label}
    </span>
  );
}
