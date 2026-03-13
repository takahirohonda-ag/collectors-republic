"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, GachaPack } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardImage } from "@/components/ui/card-image";
import { NftMintIndicator } from "./nft-mint-indicator";
import { X, Coins, AlertCircle, Hexagon } from "lucide-react";

interface NftPackOpeningModalProps {
  pack: GachaPack;
  quantity: number;
  onClose: () => void;
  onKeepAll: (cards: Card[]) => void;
  onSellBack: (coins: number) => void;
}

type Phase = "opening" | "reveal" | "result";

interface PullResult {
  card: Card;
  nft?: { nftId?: string; status: string; txHash?: string };
  collectionId?: string;
}

export function NftPackOpeningModal({ pack, quantity, onClose, onKeepAll, onSellBack }: NftPackOpeningModalProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [pullResults, setPullResults] = useState<PullResult[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pullFromApi = useCallback(async () => {
    try {
      const pulls = await Promise.all(
        Array.from({ length: quantity }, () =>
          fetch("/api/gacha/pull", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ packId: pack.id }),
          }).then((res) => {
            if (!res.ok) throw new Error("Pull failed");
            return res.json();
          })
        )
      );
      setPullResults(pulls.map((p) => ({
        card: p.card,
        nft: p.nft,
        collectionId: p.collectionId,
      })));
      setPhase("reveal");
    } catch {
      setError("Failed to pull cards. Please try again.");
    }
  }, [pack.id, quantity]);

  useEffect(() => {
    const timer = setTimeout(() => pullFromApi(), 1500);
    return () => clearTimeout(timer);
  }, [pullFromApi]);

  const pulledCards = pullResults.map((r) => r.card);
  const currentResult = pullResults[currentCardIndex];
  const totalValue = pulledCards.reduce((sum, c) => sum + c.marketValue, 0);
  const sellBackValue = Math.floor(totalValue * 0.9); // 90% FMV
  const costInCoins = pack.price * quantity;

  const handleKeepAll = () => {
    onKeepAll(pulledCards);
    setSettled(true);
  };

  const handleSellBack = () => {
    onSellBack(sellBackValue);
    setSettled(true);
  };

  const handleClose = () => {
    if (!settled && pulledCards.length > 0) {
      onKeepAll(pulledCards);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && phase === "result" && handleClose()}
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-muted hover:text-foreground z-10"
      >
        <X className="h-6 w-6" />
      </button>

      <AnimatePresence mode="wait">
        {/* Opening Phase */}
        {phase === "opening" && (
          <motion.div
            key="opening"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotateY: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              {/* NFT glow effect */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-purple-500/30 blur-xl animate-pulse" />
              <div className="relative h-64 w-48 rounded-xl bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 p-1">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-black/80">
                  <Hexagon className="h-10 w-10 text-purple-400 mb-2" />
                  <span className="text-sm font-bold text-white">{pack.name}</span>
                  <span className="text-xs text-purple-400 mt-1">NFT Edition</span>
                  <span className="text-[10px] text-muted mt-1">
                    {quantity}x Pack{quantity > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-purple-400"
            >
              Opening NFT pack...
            </motion.p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            key="error"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl bg-card border border-border p-6 text-center space-y-4"
          >
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </motion.div>
        )}

        {/* Reveal Phase */}
        {phase === "reveal" && currentResult && (
          <motion.div
            key={`reveal-${currentCardIndex}`}
            initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4">
              <p className="text-xs text-muted">
                Card {currentCardIndex + 1} of {pullResults.length}
              </p>

              {/* Card with NFT border */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 opacity-60 blur-sm" />
                <div className="relative h-80 w-56 rounded-xl bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-cyan-400/30 p-1">
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-card overflow-hidden">
                    <CardImage src={currentResult.card.imageUrl} alt={currentResult.card.name} rarity={currentResult.card.rarity} size="lg" />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground text-center">
                {currentResult.card.name}
              </h3>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">
                  {formatNumber(currentResult.card.marketValue)}
                </span>
              </div>

              {/* NFT Mint Status */}
              {currentResult.nft && (
                <NftMintIndicator
                  status={currentResult.nft.status === "minted" ? "minted" : "minting"}
                  txHash={currentResult.nft.txHash}
                />
              )}

              <div className="flex gap-3">
                {currentCardIndex < pullResults.length - 1 ? (
                  <Button onClick={() => setCurrentCardIndex((i) => i + 1)}>
                    Next Card
                  </Button>
                ) : (
                  <Button onClick={() => setPhase("result")}>
                    View Results
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl bg-card border border-border p-6"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Hexagon className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold">NFT Pull Results</h2>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {pullResults.map((result, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-9 rounded overflow-hidden flex-shrink-0">
                      <CardImage src={result.card.imageUrl} alt={result.card.name} size="sm" />
                      {result.nft && result.nft.status !== "mock" && (
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-purple-500 flex items-center justify-center">
                          <Hexagon className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{result.card.name}</p>
                      <p className="text-xs text-muted capitalize">
                        {result.card.rarity.replace("tier", "Tier ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      {formatNumber(result.card.marketValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Value</span>
                <span className="font-bold text-amber-400">{formatNumber(totalValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Cost</span>
                <span className="font-medium">{formatNumber(costInCoins)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Instant Buyback (90% FMV)</span>
                <span className="font-medium text-green-400">+{formatNumber(sellBackValue)}</span>
              </div>
            </div>

            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 mt-4">
              <p className="text-xs text-purple-400 text-center">
                Each card is minted as an NFT on Polygon. You can trade them on the Marketplace or redeem the physical card.
              </p>
            </div>

            {!settled ? (
              <div className="flex gap-3 mt-4">
                <Button variant="secondary" className="flex-1" onClick={handleKeepAll}>
                  Keep All NFTs
                </Button>
                <Button className="flex-1" onClick={handleSellBack}>
                  Sell Back (+{formatNumber(sellBackValue)})
                </Button>
              </div>
            ) : (
              <div className="mt-4 text-center space-y-3">
                <p className="text-sm text-green-400 font-medium">Done!</p>
                <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
