"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, GachaPack, CardRarity } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardImage } from "@/components/ui/card-image";
import { Particles, Sparkles } from "./particles";
import { X, Coins, AlertCircle } from "lucide-react";
import {
  playChargeUp,
  playDrumroll,
  playBurst,
  playRevealSound,
} from "@/lib/sound";

interface PackOpeningModalProps {
  pack: GachaPack;
  quantity: number;
  onClose: () => void;
  onKeepAll: (cards: Card[]) => void;
  onSellBack: (coins: number) => void;
}

type Phase = "chargeup" | "reveal" | "result";

const RARITY_CONFIG: Record<CardRarity, {
  color: string;
  glowColor: string;
  bgGradient: string;
  label: string;
  particleColor: string;
}> = {
  tier1: {
    color: "#22c55e",
    glowColor: "rgba(34,197,94,0.4)",
    bgGradient: "from-green-900/40 via-green-800/20 to-black",
    label: "COMMON",
    particleColor: "#22c55e",
  },
  tier2: {
    color: "#3b82f6",
    glowColor: "rgba(59,130,246,0.4)",
    bgGradient: "from-blue-900/40 via-blue-800/20 to-black",
    label: "RARE",
    particleColor: "#60a5fa",
  },
  tier3: {
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.5)",
    bgGradient: "from-purple-900/50 via-purple-800/20 to-black",
    label: "ULTRA RARE",
    particleColor: "#c084fc",
  },
  tier4: {
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.6)",
    bgGradient: "from-amber-900/50 via-red-900/30 to-black",
    label: "LEGENDARY",
    particleColor: "#fbbf24",
  },
};

// Charge-up color sequence: green → blue → purple → gold
const CHARGE_COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"];

function getRarityIndex(rarity: CardRarity): number {
  return { tier1: 0, tier2: 1, tier3: 2, tier4: 3 }[rarity];
}

export function PackOpeningModal({
  pack,
  quantity,
  onClose,
  onKeepAll,
  onSellBack,
}: PackOpeningModalProps) {
  const [phase, setPhase] = useState<Phase>("chargeup");
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chargeLevel, setChargeLevel] = useState(0); // 0-3 for color stages
  const [showParticles, setShowParticles] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const soundInitRef = useRef(false);

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
      return pulls.map((p) => p.card as Card);
    } catch {
      setError("Failed to pull cards. Please try again.");
      return null;
    }
  }, [pack.id, quantity]);

  // Charge-up phase
  useEffect(() => {
    if (phase !== "chargeup") return;

    // Start sounds
    if (!soundInitRef.current) {
      soundInitRef.current = true;
      playChargeUp();
      playDrumroll();
    }

    // Pull cards while animating
    let cards: Card[] | null = null;
    const pullPromise = pullFromApi().then((c) => {
      cards = c;
    });

    // Animate charge levels: cycle through colors ending on the pulled card's rarity
    const colorTimers = [
      setTimeout(() => setChargeLevel(1), 500),
      setTimeout(() => setChargeLevel(2), 1000),
      setTimeout(() => setChargeLevel(3), 1500),
    ];

    // After charge-up, transition to reveal
    const revealTimer = setTimeout(async () => {
      await pullPromise;
      if (cards && cards.length > 0) {
        setPulledCards(cards);
        // Set charge to match first card's rarity
        setChargeLevel(getRarityIndex(cards[0].rarity));
        // Brief pause then burst
        setTimeout(() => {
          playBurst();
          setShowParticles(true);
          setTimeout(() => {
            setPhase("reveal");
          }, 400);
        }, 300);
      }
    }, 2200);

    return () => {
      colorTimers.forEach(clearTimeout);
      clearTimeout(revealTimer);
    };
  }, [phase, pullFromApi]);

  // Play reveal sound when card changes
  useEffect(() => {
    if (phase === "reveal" && pulledCards[currentCardIndex]) {
      setCardRevealed(false);
      setShowParticles(false);
      const timer = setTimeout(() => {
        playRevealSound(pulledCards[currentCardIndex].rarity);
        setShowParticles(true);
        setCardRevealed(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, currentCardIndex, pulledCards]);

  const currentCard = pulledCards[currentCardIndex];
  const totalValue = pulledCards.reduce((sum, c) => sum + c.marketValue, 0);
  const sellBackValue = Math.floor(totalValue * 0.8);
  const costInCoins = pack.price * quantity;
  const currentConfig = currentCard
    ? RARITY_CONFIG[currentCard.rarity]
    : RARITY_CONFIG.tier1;

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

  const handleNextCard = () => {
    setCurrentCardIndex((i) => i + 1);
  };

  // Find best card for result summary highlight
  const bestCard = pulledCards.reduce(
    (best, card) =>
      getRarityIndex(card.rarity) > getRarityIndex(best.rarity) ? card : best,
    pulledCards[0] || { rarity: "tier1" as CardRarity }
  );
  const bestConfig = RARITY_CONFIG[bestCard?.rarity || "tier1"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      onClick={(e) =>
        e.target === e.currentTarget && phase === "result" && handleClose()
      }
    >
      {/* Dynamic background */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 bg-gradient-to-b ${
          phase === "chargeup"
            ? "from-black via-gray-950 to-black"
            : currentConfig.bgGradient
        }`}
        style={{ opacity: 0.95 }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {phase !== "chargeup" && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white z-20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* ============ CHARGE-UP PHASE ============ */}
        {phase === "chargeup" && !error && (
          <motion.div
            key="chargeup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col items-center justify-center z-10"
          >
            {/* Glowing orb */}
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.1 + chargeLevel * 0.1, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {/* Outer glow rings */}
              {[0, 1, 2].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid ${CHARGE_COLORS[chargeLevel]}`,
                    opacity: 0.3 - ring * 0.1,
                    transform: `scale(${1.5 + ring * 0.5})`,
                  }}
                  animate={{
                    scale: [1.5 + ring * 0.5, 2 + ring * 0.5, 1.5 + ring * 0.5],
                    opacity: [0.3 - ring * 0.1, 0.1, 0.3 - ring * 0.1],
                  }}
                  transition={{
                    duration: 1.5 - chargeLevel * 0.2,
                    repeat: Infinity,
                    delay: ring * 0.2,
                  }}
                />
              ))}

              {/* Core orb */}
              <motion.div
                className="h-32 w-32 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${CHARGE_COLORS[chargeLevel]}, ${CHARGE_COLORS[chargeLevel]}44 60%, transparent)`,
                  boxShadow: `0 0 ${40 + chargeLevel * 30}px ${CHARGE_COLORS[chargeLevel]}, 0 0 ${80 + chargeLevel * 40}px ${CHARGE_COLORS[chargeLevel]}66`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 ${40 + chargeLevel * 30}px ${CHARGE_COLORS[chargeLevel]}, 0 0 ${80 + chargeLevel * 40}px ${CHARGE_COLORS[chargeLevel]}66`,
                    `0 0 ${60 + chargeLevel * 40}px ${CHARGE_COLORS[chargeLevel]}, 0 0 ${120 + chargeLevel * 50}px ${CHARGE_COLORS[chargeLevel]}88`,
                    `0 0 ${40 + chargeLevel * 30}px ${CHARGE_COLORS[chargeLevel]}, 0 0 ${80 + chargeLevel * 40}px ${CHARGE_COLORS[chargeLevel]}66`,
                  ],
                }}
                transition={{
                  duration: 0.8 - chargeLevel * 0.1,
                  repeat: Infinity,
                }}
              />
            </motion.div>

            {/* Pack info text */}
            <motion.div
              className="mt-12 text-center"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <p className="text-lg font-bold text-white">{pack.name}</p>
              <p className="text-sm text-white/60 mt-1">
                {quantity}x Pack{quantity > 1 ? "s" : ""}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* ============ ERROR ============ */}
        {error && (
          <motion.div
            key="error"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl bg-card border border-border p-6 text-center space-y-4 z-10"
          >
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </motion.div>
        )}

        {/* ============ REVEAL PHASE ============ */}
        {phase === "reveal" && currentCard && (
          <motion.div
            key={`reveal-${currentCardIndex}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="relative flex flex-col items-center z-10 w-full max-w-sm px-4"
          >
            {/* Particles explosion */}
            {showParticles && (
              <Particles
                count={40}
                color={currentConfig.particleColor}
                spread={250}
              />
            )}

            {/* Background glow */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="h-[500px] w-[500px] rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${currentConfig.glowColor}, transparent 70%)`,
                }}
              />
            </motion.div>

            {/* Rarity label */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-2 z-10"
            >
              <span
                className="text-xs font-black tracking-[0.3em] px-4 py-1 rounded-full"
                style={{
                  color: currentConfig.color,
                  backgroundColor: `${currentConfig.color}15`,
                  border: `1px solid ${currentConfig.color}40`,
                  textShadow: `0 0 20px ${currentConfig.color}`,
                }}
              >
                {currentConfig.label}
              </span>
            </motion.div>

            {/* Card counter */}
            <p className="text-xs text-white/40 mb-3 z-10">
              {currentCardIndex + 1} / {pulledCards.length}
            </p>

            {/* Card with flip animation */}
            <motion.div
              className="relative z-10"
              initial={{ rotateY: 180, scale: 0.5 }}
              animate={{
                rotateY: cardRevealed ? 0 : 180,
                scale: cardRevealed ? 1 : 0.5,
              }}
              transition={{ type: "spring", damping: 15, stiffness: 150 }}
              style={{ perspective: 1000 }}
            >
              {/* Card border glow */}
              <div
                className="rounded-2xl p-[2px]"
                style={{
                  background: `linear-gradient(135deg, ${currentConfig.color}, ${currentConfig.color}44, ${currentConfig.color})`,
                  boxShadow: `0 0 30px ${currentConfig.glowColor}, 0 0 60px ${currentConfig.glowColor}`,
                }}
              >
                <div className="rounded-2xl bg-black/80 p-2">
                  <div className="h-80 w-56 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                    <CardImage
                      src={currentCard.imageUrl}
                      alt={currentCard.name}
                      rarity={currentCard.rarity}
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              {/* Sparkles on legendary */}
              {currentCard.rarity === "tier4" && (
                <Sparkles color={currentConfig.particleColor} />
              )}
              {currentCard.rarity === "tier3" && (
                <Sparkles color={currentConfig.particleColor} />
              )}
            </motion.div>

            {/* Card info */}
            <motion.div
              className="mt-4 text-center z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white">
                {currentCard.name}
              </h3>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-black text-amber-400">
                  {formatNumber(currentCard.marketValue)}
                </span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="mt-6 z-10 w-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0 }}
              transition={{ delay: 0.4 }}
            >
              {currentCardIndex < pulledCards.length - 1 ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleNextCard}
                >
                  Next Card ({currentCardIndex + 2}/{pulledCards.length})
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setPhase("result")}
                >
                  View Results
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ============ RESULT PHASE ============ */}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-4 w-full max-w-md z-10"
          >
            {/* Header with best card highlight */}
            <motion.div
              className="text-center mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <h2
                className="text-2xl font-black"
                style={{
                  color: bestConfig.color,
                  textShadow: `0 0 30px ${bestConfig.glowColor}`,
                }}
              >
                PULL RESULTS
              </h2>
              <p className="text-xs text-white/40 mt-1">
                {pulledCards.length} card{pulledCards.length > 1 ? "s" : ""}{" "}
                pulled
              </p>
            </motion.div>

            <div className="rounded-2xl bg-black/70 border border-white/10 backdrop-blur-lg p-4">
              {/* Card list */}
              <div className="space-y-2 max-h-56 overflow-y-auto mb-4 pr-1">
                {pulledCards.map((card, i) => {
                  const cfg = RARITY_CONFIG[card.rarity];
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-xl p-2.5"
                      style={{
                        backgroundColor: `${cfg.color}08`,
                        border: `1px solid ${cfg.color}20`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-9 rounded-lg overflow-hidden flex-shrink-0">
                          <CardImage
                            src={card.imageUrl}
                            alt={card.name}
                            size="sm"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {card.name}
                          </p>
                          <p
                            className="text-[10px] font-bold tracking-wider"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">
                          {formatNumber(card.marketValue)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="border-t border-white/10 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Value</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-400" />
                    <span className="font-bold text-amber-400">
                      {formatNumber(totalValue)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Cost</span>
                  <span className="font-medium text-white/70">
                    {formatNumber(costInCoins)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Sell Back (80%)</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-green-400" />
                    <span className="font-medium text-green-400">
                      +{formatNumber(sellBackValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!settled ? (
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleKeepAll}
                  >
                    Keep All
                  </Button>
                  <Button className="flex-1" onClick={handleSellBack}>
                    Sell Back (+{formatNumber(sellBackValue)})
                  </Button>
                </div>
              ) : (
                <div className="mt-4 text-center space-y-3">
                  <motion.p
                    className="text-sm font-medium text-green-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    Done!
                  </motion.p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
