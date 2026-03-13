"use client";

import { PulledCard } from "@/types";
import { cn } from "@/lib/utils";

interface JustPulledProps {
  cards: PulledCard[];
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function JustPulled({ cards }: JustPulledProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Just Pulled</h3>
        <button className="text-xs text-muted hover:text-foreground transition-colors">
          See all &gt;
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cards.slice(0, 4).map((pulled) => (
          <div
            key={pulled.id}
            className="rounded-lg bg-card border border-border p-2 transition-colors hover:bg-card-hover"
          >
            <div className="aspect-[3/4] rounded-md bg-gradient-to-br from-amber-500/20 to-purple-500/20 mb-2 flex items-center justify-center overflow-hidden">
              <div className="text-2xl">🃏</div>
            </div>
            <p className="text-xs font-medium text-foreground truncate">
              {pulled.card.name}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-red-500 to-amber-500" />
              <span className="text-[10px] text-muted truncate">
                {pulled.username}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
