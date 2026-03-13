import { cn } from "@/lib/utils";
import { PackTier } from "@/types";

interface BadgeProps {
  tier: PackTier;
  className?: string;
}

const tierConfig = {
  basic: { label: "Basic", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  elite: { label: "Elite", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  legendary: { label: "Legendary", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
};

export function TierBadge({ tier, className }: BadgeProps) {
  const config = tierConfig[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}
