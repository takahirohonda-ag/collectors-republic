"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PackTier } from "@/types";
import { gachaPacks, justPulledCards, CardCategory } from "@/data/mock";
import { formatNumber } from "@/lib/utils";
import { Coins } from "lucide-react";
import { useUser } from "@/context/user-context";

import { CategorySelector } from "@/components/gacha/category-selector";
import { PackSelector } from "@/components/gacha/pack-selector";
import { QuantitySelector } from "@/components/gacha/quantity-selector";
import { GachaMachine } from "@/components/gacha/gacha-machine";
import { ProbabilityTable } from "@/components/gacha/probability-table";
import { JustPulled } from "@/components/gacha/just-pulled";
import { CardsInPack } from "@/components/gacha/cards-in-pack";
import { WhyChooseUs } from "@/components/gacha/why-choose-us";
import { PackOpeningModal } from "@/components/gacha/pack-opening-modal";
import { Button } from "@/components/ui/button";

export default function GachaPage() {
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>("Pokemon");
  const [selectedTier, setSelectedTier] = useState<PackTier>("basic");
  const [quantity, setQuantity] = useState(1);
  const [isOpening, setIsOpening] = useState(false);
  const { coinBalance, spendCoins, addCoins, addToCollection } = useUser();

  const categoryPacks = gachaPacks.filter((p) => p.category === selectedCategory);
  const currentPack = categoryPacks.find((p) => p.tier === selectedTier) ?? categoryPacks[0];
  const totalCost = currentPack.price * quantity;
  const canAfford = coinBalance >= totalCost;

  const filteredPulled = justPulledCards.filter((p) => p.card.series === selectedCategory);

  const handleOpenPack = () => {
    if (spendCoins(totalCost)) {
      setIsOpening(true);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Category Selector */}
        <section>
          <CategorySelector selected={selectedCategory} onChange={(cat) => {
            setSelectedCategory(cat);
            setSelectedTier("basic");
          }} />
        </section>

        {/* Machine + Pack Selector */}
        <section className="space-y-4">
          <QuantitySelector selected={quantity} onChange={setQuantity} />

          <div className="flex justify-center">
            <GachaMachine pack={currentPack} />
          </div>

          <PackSelector selected={selectedTier} onChange={setSelectedTier} />
        </section>

        {/* Pack Info */}
        <section className="rounded-xl bg-card border border-border p-4 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{currentPack.name}</h2>
            <p className="text-xs text-muted mt-0.5">
              Price: <span className="text-foreground font-medium">{formatNumber(currentPack.price)}</span>{" "}
              <span className="text-amber-400">Coins</span>
            </p>
          </div>

          <p className="text-xs text-muted leading-relaxed">{currentPack.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">EXPECTED VALUE</span>
            <span className="text-lg font-bold text-green-400">
              {formatNumber(currentPack.expectedValue)} <span className="text-xs">Coins</span>
            </span>
          </div>

          <ProbabilityTable probabilities={currentPack.probabilities} />
        </section>

        {/* Just Pulled */}
        <section>
          <JustPulled cards={filteredPulled.length > 0 ? filteredPulled : justPulledCards} />
        </section>

        {/* Cards in Pack */}
        <section>
          <CardsInPack cards={currentPack.cardsInPack} />
        </section>

        {/* Why Choose Us */}
        <section>
          <WhyChooseUs />
        </section>

        {/* Spacer for sticky footer */}
        <div className="h-20" />
      </div>

      {/* Sticky Footer - Open Pack Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-xl p-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold">{formatNumber(totalCost)}</span>
            <span className="text-xs text-muted">COINS</span>
          </div>
          <Button
            size="lg"
            onClick={handleOpenPack}
            disabled={!canAfford}
            className="px-8"
          >
            {canAfford ? "🎴 OPEN PACK" : "Not enough coins"}
          </Button>
        </div>
      </div>

      {/* Pack Opening Modal */}
      <AnimatePresence>
        {isOpening && (
          <PackOpeningModal
            pack={currentPack}
            quantity={quantity}
            onClose={() => setIsOpening(false)}
            onKeepAll={(cards) => addToCollection(cards)}
            onSellBack={(coins) => addCoins(coins)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
