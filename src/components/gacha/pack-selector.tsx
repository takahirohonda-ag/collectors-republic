"use client";

import { cn } from "@/lib/utils";
import { PackTier } from "@/types";

interface PackSelectorProps {
  selected: PackTier;
  onChange: (tier: PackTier) => void;
}

const tiers: { value: PackTier; label: string; color: string }[] = [
  { value: "basic", label: "Basic", color: "text-green-400 border-green-500" },
  { value: "elite", label: "Elite", color: "text-blue-400 border-blue-500" },
  { value: "legendary", label: "Legendary", color: "text-amber-400 border-amber-500" },
];

export function PackSelector({ selected, onChange }: PackSelectorProps) {
  return (
    <div className="flex gap-2">
      {tiers.map((tier) => (
        <button
          key={tier.value}
          onClick={() => onChange(tier.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
            selected === tier.value
              ? `${tier.color} bg-white/5`
              : "text-muted border-border hover:text-foreground hover:border-muted"
          )}
        >
          {tier.label}
        </button>
      ))}
    </div>
  );
}
