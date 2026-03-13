"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, GachaPack } from "@/types";
import { pullCard } from "@/data/mock";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PackOpeningModalProps {
  pack: GachaPack;
  quantity: number;
  onClose: () => void;
}

type Phase = "opening" | "reveal" | "result";

export function PackOpeningModal({ pack, quantity, onClose }: PackOpeningModalProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    // Pull cards
    const cards = Array.from({ length: quantity }, () => pullCard(pack));
    setPulledCards(cards);

    // Phase transitions
    const timer1 = setTimeout(() => setPhase("reveal"), 2000);
    return () => clearTimeout(timer1);
  }, [pack, quantity]);

  const currentCard = pulledCards[currentCardIndex];
  const totalValue = pulledCards.reduce((sum, c) => sum + c.marketValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && phase === "result" && onClose()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted hover:text-foreground z-10"
      >
        <X className="h-6 w-6" />
      </button>

      <AnimatePresence mode="wait">
        {/* Opening Phase - Pack animation */}
        {phase === "opening" && (
          <motion.div
            key="opening"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{
                rotateY: [0, 10, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <div className="h-64 w-48 rounded-xl bg-gradient-to-br from-amber-500 via-red-500 to-purple-600 p-1 animate-pack-glow">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-black/80">
                  <span className="text-4xl mb-2">🎴</span>
                  <span className="text-sm font-bold text-white">{pack.name}</span>
                  <span className="text-xs text-amber-400 mt-1">
                    {quantity}x Pack{quantity > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-muted"
            >
              Opening pack...
            </motion.p>
          </motion.div>
        )}

        {/* Reveal Phase - Card by card */}
        {phase === "reveal" && currentCard && (
          <motion.div
            key={`reveal-${currentCardIndex}`}
            initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="flex flex-col items-center gap-6"
          >
            {/* Glow background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4">
              <p className="text-xs text-muted">
                Card {currentCardIndex + 1} of {pulledCards.length}
              </p>

              <div className="h-80 w-56 rounded-xl bg-gradient-to-br from-amber-500/30 via-purple-500/20 to-blue-500/30 p-1">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-card">
                  <span className="text-6xl mb-4">🃏</span>
                  <h3 className="text-lg font-bold text-foreground text-center px-4">
                    {currentCard.name}
                  </h3>
                  <p className="text-amber-400 font-bold text-xl mt-2">
                    {formatCurrency(currentCard.marketValue)}
                  </p>
                  <span className="text-xs text-muted mt-1 capitalize">
                    {currentCard.rarity.replace("tier", "Tier ")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                {currentCardIndex < pulledCards.length - 1 ? (
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

        {/* Result Phase - Summary */}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl bg-card border border-border p-6"
          >
            <h2 className="text-lg font-bold text-center mb-4">Pull Results</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {pulledCards.map((card, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🃏</span>
                    <div>
                      <p className="text-sm font-medium">{card.name}</p>
                      <p className="text-xs text-muted capitalize">
                        {card.rarity.replace("tier", "Tier ")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-400">
                    {formatCurrency(card.marketValue)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Value</span>
                <span className="font-bold text-amber-400">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Cost</span>
                <span className="font-medium">
                  {formatCurrency(pack.price * quantity)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Sell Back (80%)</span>
                <span className="font-medium text-green-400">
                  {formatCurrency(Math.floor(totalValue * 0.8))}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Keep All
              </Button>
              <Button className="flex-1">Sell Back</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
