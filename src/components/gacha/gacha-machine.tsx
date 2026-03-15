"use client";

import { GachaPack, PackTier } from "@/types";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";

interface GachaMachineProps {
  pack: GachaPack;
}

const tierConfig: Record<PackTier, {
  gradient: string;
  borderColor: string;
  glowColor: string;
  badge: string;
  badgeColor: string;
}> = {
  basic: {
    gradient: "from-emerald-600 via-green-500 to-emerald-700",
    borderColor: "border-emerald-400/40",
    glowColor: "shadow-emerald-500/20",
    badge: "BASIC",
    badgeColor: "bg-emerald-500",
  },
  elite: {
    gradient: "from-blue-600 via-indigo-500 to-blue-700",
    borderColor: "border-blue-400/40",
    glowColor: "shadow-blue-500/20",
    badge: "ELITE",
    badgeColor: "bg-blue-500",
  },
  legendary: {
    gradient: "from-amber-500 via-yellow-400 to-orange-500",
    borderColor: "border-amber-400/40",
    glowColor: "shadow-amber-500/30",
    badge: "LEGENDARY",
    badgeColor: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
};

export function GachaMachine({ pack }: GachaMachineProps) {
  const config = tierConfig[pack.tier];
  // Show up to 5 featured cards from the pack
  const featuredCards = pack.cardsInPack.slice(0, 5);

  return (
    <div className="w-full">
      {/* Banner card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2",
          config.borderColor,
          `shadow-lg ${config.glowColor}`
        )}
      >
        {/* Background gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", config.gradient)} />

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative px-4 py-5">
          {/* Top: Badge + Category */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-black tracking-widest text-white px-2.5 py-0.5 rounded-full", config.badgeColor)}>
                {config.badge}
              </span>
              <span className="text-white/80 text-xs font-medium">{pack.category}</span>
            </div>
            <div className="text-right">
              <span className="text-white text-lg font-black">{formatNumber(pack.price)}</span>
              <span className="text-white/70 text-xs ml-1">Coins</span>
            </div>
          </div>

          {/* Center: Card fan display */}
          <div className="flex justify-center items-end h-36 -mb-2">
            {featuredCards.map((card, i) => {
              const totalCards = featuredCards.length;
              const mid = (totalCards - 1) / 2;
              const offset = i - mid;
              const rotate = offset * 8;
              const translateY = Math.abs(offset) * 8;
              const zIndex = totalCards - Math.abs(offset);

              return (
                <div
                  key={card.id}
                  className="relative -mx-3 transition-transform"
                  style={{
                    transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
                    zIndex,
                  }}
                >
                  <div className="w-20 h-28 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg bg-gray-900">
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      width={80}
                      height={112}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom: Pack name */}
          <div className="text-center mt-3">
            <h3 className="text-white font-bold text-base drop-shadow-lg">{pack.name}</h3>
            <p className="text-white/60 text-[11px] mt-0.5">
              Expected value: <span className="text-white/90 font-semibold">{formatNumber(pack.expectedValue)} Coins</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
