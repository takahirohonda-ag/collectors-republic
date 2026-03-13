import { ProbabilityTier } from "@/types";

interface ProbabilityTableProps {
  probabilities: ProbabilityTier[];
}

export function ProbabilityTable({ probabilities }: ProbabilityTableProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Probabilities</h3>
      <div className="space-y-1.5">
        {probabilities.map((prob) => (
          <div key={prob.rarity} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">{prob.label}</span>
              <span
                className="text-xs font-medium"
                style={{ color: prob.color }}
              >
                {prob.valueRange}
              </span>
            </div>
            <span className="text-sm font-bold" style={{ color: prob.color }}>
              {prob.percentage} %
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted leading-tight mt-2">
        * Pricing data is taken from PriceCharting.com and other platforms, and is subject to change.
        <br />* 1 pull includes 1 card.
      </p>
    </div>
  );
}
