"use client";

import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  selected: number;
  onChange: (qty: number) => void;
}

const quantities = [1, 10, 100];

export function QuantitySelector({ selected, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex gap-2">
      {quantities.map((qty) => (
        <button
          key={qty}
          onClick={() => onChange(qty)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all border",
            selected === qty
              ? "bg-red-500/20 text-red-400 border-red-500/50"
              : "text-muted border-border hover:text-foreground"
          )}
        >
          {qty} {qty === 1 ? "PACK" : "PACKS"}
        </button>
      ))}
    </div>
  );
}
