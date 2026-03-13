import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Percent } from "lucide-react";
import Link from "next/link";

export default function CampaignPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-red-500/20 via-amber-500/10 to-purple-500/20 border border-red-500/30 p-6 text-center space-y-4">
        <Sparkles className="mx-auto h-10 w-10 text-amber-400" />
        <h1 className="text-2xl font-bold">Launch Campaign</h1>
        <div className="flex items-center justify-center gap-2">
          <Percent className="h-6 w-6 text-green-400" />
          <span className="text-3xl font-bold text-green-400">0%</span>
          <span className="text-lg text-muted">Sell-Back Fee</span>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          For a limited time, sell back cards at <span className="text-green-400 font-bold">full 80% value</span> with zero platform fees.
          Standard fees will apply after the launch period.
        </p>
      </div>

      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Gift className="h-4 w-4 text-purple-400" />
          Launch Bonuses
        </h2>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="text-green-400">&#10003;</span>
            First pack opening is FREE (100 bonus coins on signup)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">&#10003;</span>
            Refer a friend and both get 500 bonus points
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">&#10003;</span>
            Free shipping on all orders during launch
          </li>
        </ul>
      </div>

      <Link href="/">
        <Button size="lg" className="w-full">Start Opening Packs</Button>
      </Link>
    </div>
  );
}
