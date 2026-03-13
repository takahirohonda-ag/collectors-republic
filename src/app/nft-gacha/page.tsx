"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PackTier } from "@/types";
import { gachaPacks, justPulledCards, CardCategory } from "@/data/mock";
import { formatNumber } from "@/lib/utils";
import { Coins, Hexagon } from "lucide-react";
import { useUser } from "@/context/user-context";

import { CategorySelector } from "@/components/gacha/category-selector";
import { PackSelector } from "@/components/gacha/pack-selector";
import { QuantitySelector } from "@/components/gacha/quantity-selector";
import { ProbabilityTable } from "@/components/gacha/probability-table";
import { JustPulled } from "@/components/gacha/just-pulled";
import { CardsInPack } from "@/components/gacha/cards-in-pack";
import { NftPackOpeningModal } from "@/components/nft/nft-pack-opening-modal";
import { Button } from "@/components/ui/button";

export default function NftGachaPage() {
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>("Pokemon");
  const [selectedTier, setSelectedTier] = useState<PackTier>("basic");
  const [quantity, setQuantity] = useState(1);
  const [isOpening, setIsOpening] = useState(false);
  const { coinBalance, spendCoins, addCoins, addToCollection, refreshBalance } = useUser();

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
        {/* NFT Banner */}
        <section className="rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Hexagon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">NFT Gacha</h1>
              <p className="text-xs text-muted">Every card is minted as an NFT on Polygon</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-lg bg-black/20 p-2 text-center">
              <p className="text-[10px] text-muted">Blockchain</p>
              <p className="text-xs font-medium text-purple-400">Polygon</p>
            </div>
            <div className="rounded-lg bg-black/20 p-2 text-center">
              <p className="text-[10px] text-muted">Buyback</p>
              <p className="text-xs font-medium text-green-400">90% FMV</p>
            </div>
            <div className="rounded-lg bg-black/20 p-2 text-center">
              <p className="text-[10px] text-muted">Gas Fee</p>
              <p className="text-xs font-medium text-amber-400">Free</p>
            </div>
          </div>
        </section>

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

          {/* NFT Machine (styled differently from regular gacha) */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Purple NFT glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-cyan-500/20 blur-3xl" />
              <div className="relative">
                <div className="h-64 w-52 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-b from-purple-900/40 to-black p-1">
                  <div className="flex h-full flex-col items-center justify-center rounded-xl bg-black/60">
                    <div className="mb-3 h-24 w-36 rounded-lg bg-gradient-to-br from-purple-800 to-gray-900 border border-purple-700 flex items-center justify-center overflow-hidden">
                      <div className="text-center">
                        <Hexagon className="h-8 w-8 text-purple-400 mx-auto" />
                        <p className="text-[10px] text-purple-400 font-medium mt-1">
                          {selectedCategory} NFT
                        </p>
                      </div>
                    </div>
                    <div className="h-16 w-28 rounded-lg bg-gradient-to-b from-purple-700/50 to-gray-800 border border-purple-600/50 flex items-center justify-center">
                      <div className="h-12 w-8 rounded bg-gradient-to-b from-purple-500 to-purple-700 border border-purple-400/30" />
                    </div>
                    <div className="mt-3 h-6 w-20 rounded-full bg-gray-800 border border-purple-600/50 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <PackSelector selected={selectedTier} onChange={setSelectedTier} />
        </section>

        {/* Pack Info */}
        <section className="rounded-xl bg-card border border-border p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{currentPack.name}</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">NFT</span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Price: <span className="text-foreground font-medium">{formatNumber(currentPack.price)}</span>{" "}
              <span className="text-amber-400">Coins</span>
            </p>
          </div>

          <p className="text-xs text-muted leading-relaxed">{currentPack.description}</p>
          <p className="text-xs text-purple-400 leading-relaxed">
            Each card is automatically minted as an ERC-721 NFT. Trade on the Marketplace or redeem the physical card anytime.
          </p>

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

        {/* Spacer */}
        <div className="h-20" />
      </div>

      {/* Sticky Footer */}
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
            className="px-8 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 shadow-lg shadow-purple-500/20"
          >
            {canAfford ? (
              <span className="flex items-center gap-2">
                <Hexagon className="h-4 w-4" />
                OPEN NFT PACK
              </span>
            ) : (
              "Not enough coins"
            )}
          </Button>
        </div>
      </div>

      {/* NFT Pack Opening Modal */}
      <AnimatePresence>
        {isOpening && (
          <NftPackOpeningModal
            pack={currentPack}
            quantity={quantity}
            onClose={() => { setIsOpening(false); refreshBalance(); }}
            onKeepAll={(cards) => addToCollection(cards)}
            onSellBack={(coins) => addCoins(coins)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
