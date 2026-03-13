"use client";

import { GachaPack, PackTier } from "@/types";
import { cn } from "@/lib/utils";

interface GachaMachineProps {
  pack: GachaPack;
}

const tierGradients: Record<PackTier, string> = {
  basic: "from-green-500/20 via-emerald-500/10 to-green-600/20",
  elite: "from-blue-500/20 via-cyan-500/10 to-blue-600/20",
  legendary: "from-amber-500/20 via-yellow-500/10 to-orange-600/20",
};

export function GachaMachine({ pack }: GachaMachineProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect behind machine */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl bg-gradient-to-br blur-3xl opacity-30",
          tierGradients[pack.tier]
        )}
      />

      {/* Machine */}
      <div className="relative">
        <div
          className={cn(
            "h-64 w-52 rounded-2xl border-2 bg-gradient-to-b p-1",
            pack.tier === "basic" && "border-green-500/30 from-green-900/40 to-black",
            pack.tier === "elite" && "border-blue-500/30 from-blue-900/40 to-black",
            pack.tier === "legendary" && "border-amber-500/30 from-amber-900/40 to-black"
          )}
        >
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-black/60">
            {/* Screen area */}
            <div className="mb-3 h-24 w-36 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <span className="text-3xl">🎰</span>
                <p className="text-[10px] text-amber-400 font-medium mt-1">
                  {pack.category}
                </p>
              </div>
            </div>

            {/* Pack slot */}
            <div className="h-16 w-28 rounded-lg bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center">
              <div className="h-12 w-8 rounded bg-gradient-to-b from-red-500 to-red-700 border border-red-400/30" />
            </div>

            {/* Dispenser */}
            <div className="mt-3 h-6 w-20 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
