"use client";

import { cn } from "@/lib/utils";
import { CardCategory, categories } from "@/data/mock";

interface CategorySelectorProps {
  selected: CardCategory;
  onChange: (category: CardCategory) => void;
}

const categoryConfig: Record<CardCategory, { label: string; icon: string; gradient: string; activeGradient: string }> = {
  Pokemon: {
    label: "Pokemon",
    icon: "⚡",
    gradient: "from-yellow-500/10 to-amber-500/10 border-yellow-500/20",
    activeGradient: "from-yellow-500 to-amber-500 text-black border-yellow-500",
  },
  "One Piece": {
    label: "One Piece",
    icon: "🏴‍☠️",
    gradient: "from-red-500/10 to-orange-500/10 border-red-500/20",
    activeGradient: "from-red-500 to-orange-500 text-white border-red-500",
  },
};

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="flex gap-2">
      {categories.map((cat) => {
        const config = categoryConfig[cat];
        const isActive = selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 px-4 text-sm font-bold transition-all",
              isActive
                ? `bg-gradient-to-r ${config.activeGradient} shadow-lg`
                : `bg-gradient-to-r ${config.gradient} text-muted hover:text-foreground`
            )}
          >
            <span className="text-lg">{config.icon}</span>
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
