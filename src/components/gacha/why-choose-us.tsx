import { RefreshCw, Eye, MapPin, Truck } from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "Build together",
    description: "Trade any unwanted pulls back into coins and keep hunting your grails.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Clear, fixed probabilities for every tier, randomized by our proprietary algorithm.",
  },
  {
    icon: MapPin,
    title: "Japan-Sourced Inventory",
    description: "All cards come directly from trusted partners in Japan.",
  },
  {
    icon: Truck,
    title: "Fast, Protected Shipping",
    description: "Cards are pre-shipped to the UAE for 3 business day delivery.",
  },
];

export function WhyChooseUs() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Why Collectors Choose Us
      </h3>
      <div className="space-y-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 rounded-lg p-2"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
              <feature.icon className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {feature.title}
              </p>
              <p className="text-xs text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
