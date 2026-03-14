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
  playKyuiin,
  playColorUpgrade,
  playDiceImpact,
  playFreeze,
  playRevival,
  playRevealFanfare,
  playHeartbeat,
} from "@/lib/sound";

interface PackOpeningModalProps {
  pack: GachaPack;
  quantity: number;
  onClose: () => void;
  onKeepAll: (cards: Card[]) => void;
  onSellBack: (coins: number) => void;
}

// Phase flow: dice-rise → dice-color → dice-land → (freeze?) → (revival?) → card-reveal → result
type Phase =
  | "dice-rise"    // Dice floating up with kyuiin
  | "dice-color"   // Dice color changes based on rarity
  | "dice-land"    // Dice slam onto plate
  | "freeze"       // Screen blackout (tier3+)
  | "revival"      // Fake-out then upgrade (random chance on tier2+)
  | "card-reveal"  // Card appears
  | "result";      // Summary

const RARITY_CONFIG: Record<CardRarity, {
  color: string;
  glowColor: string;
  bgGradient: string;
  label: string;
  diceColor: string;
  particleColor: string;
}> = {
  tier1: {
    color: "#22c55e",
    glowColor: "rgba(34,197,94,0.4)",
    bgGradient: "from-green-900/40 via-black to-black",
    label: "COMMON",
    diceColor: "#ffffff",
    particleColor: "#22c55e",
  },
  tier2: {
    color: "#3b82f6",
    glowColor: "rgba(59,130,246,0.5)",
    bgGradient: "from-blue-900/50 via-blue-950/30 to-black",
    label: "RARE",
    diceColor: "#ef4444",
    particleColor: "#60a5fa",
  },
  tier3: {
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.5)",
    bgGradient: "from-purple-900/50 via-purple-950/30 to-black",
    label: "ULTRA RARE",
    diceColor: "#1a1a2e",
    particleColor: "#c084fc",
  },
  tier4: {
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.6)",
    bgGradient: "from-amber-900/60 via-red-950/30 to-black",
    label: "🔥 LEGENDARY 🔥",
    diceColor: "#f59e0b",
    particleColor: "#fbbf24",
  },
};

// Dice faces for display
const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function getRarityIndex(rarity: CardRarity): number {
  return { tier1: 0, tier2: 1, tier3: 2, tier4: 3 }[rarity];
}

// Generate dice result based on rarity
function getDiceResult(rarity: CardRarity): [number, number, number] {
  switch (rarity) {
    case "tier4": return [0, 0, 0]; // ピンゾロ (1-1-1)
    case "tier3": return [5, 5, 5]; // ゾロ目
    case "tier2": return [3, 4, 5]; // ジゴロ (4-5-6)
    default: {
      // Random non-matching
      const a = Math.floor(Math.random() * 6);
      let b = Math.floor(Math.random() * 6);
      while (b === a) b = Math.floor(Math.random() * 6);
      let c = Math.floor(Math.random() * 6);
      while (c === a || c === b) c = Math.floor(Math.random() * 6);
      return [a, b, c];
    }
  }
}

export function PackOpeningModal({
  pack,
  quantity,
  onClose,
  onKeepAll,
  onSellBack,
}: PackOpeningModalProps) {
  const [phase, setPhase] = useState<Phase>("dice-rise");
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dice animation state
  const [diceColorStage, setDiceColorStage] = useState(0); // 0=white, 1=red, 2=dark, 3=gold
  const [diceValues, setDiceValues] = useState<[number, number, number]>([0, 0, 0]);
  const [diceSpinning, setDiceSpinning] = useState(true);
  const [screenShake, setScreenShake] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);

  const initRef = useRef(false);
  const cardsRef = useRef<Card[]>([]);

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

  // === MAIN ANIMATION SEQUENCE ===
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    (async () => {
      // Start pulling cards immediately (parallel with animation)
      const pullPromise = pullFromApi();

      // --- Phase 1: DICE RISE (0-2.5s) ---
      // キュイーン sound
      playKyuiin(2.5);

      // Dice spin rapidly during rise
      const spinInterval = setInterval(() => {
        setDiceValues([
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 6),
        ]);
      }, 80);
      timers.push(spinInterval as unknown as ReturnType<typeof setTimeout>);

      // Wait for cards
      const cards = await pullPromise;
      if (!cards || cards.length === 0) {
        clearInterval(spinInterval);
        return;
      }
      cardsRef.current = cards;
      setPulledCards(cards);

      const firstCard = cards[0];
      const targetRarity = getRarityIndex(firstCard.rarity);

      // --- Phase 2: DICE COLOR CHANGES (2.5-4.5s) ---
      t(() => {
        setPhase("dice-color");
        // Always start white, then upgrade through colors up to rarity
        if (targetRarity >= 1) {
          t(() => { setDiceColorStage(1); playColorUpgrade(); setScreenShake(true); t(() => setScreenShake(false), 200); }, 300);
        }
        if (targetRarity >= 2) {
          t(() => { setDiceColorStage(2); playColorUpgrade(); setScreenShake(true); t(() => setScreenShake(false), 200); }, 800);
        }
        if (targetRarity >= 3) {
          t(() => { setDiceColorStage(3); playColorUpgrade(); setScreenShake(true); t(() => setScreenShake(false), 200); }, 1300);
        }
      }, 2500);

      // --- Phase 3: DICE LAND (4.5s) ---
      t(() => {
        clearInterval(spinInterval);
        setDiceSpinning(false);
        const result = getDiceResult(firstCard.rarity);
        setDiceValues(result);
        setPhase("dice-land");
        playDiceImpact();
        setScreenShake(true);
        t(() => setScreenShake(false), 300);
        setFlashWhite(true);
        t(() => setFlashWhite(false), 150);
      }, 4500);

      // --- Phase 4: FREEZE for tier3+ (5.5s) ---
      if (targetRarity >= 2) {
        t(() => {
          setPhase("freeze");
          playFreeze();
        }, 5500);

        // Heartbeat in darkness
        t(() => playHeartbeat(), 6200);
        t(() => playHeartbeat(), 7000);

        // Revival / emerge from darkness
        t(() => {
          playRevival();
          setFlashWhite(true);
          t(() => setFlashWhite(false), 200);
          setPhase("card-reveal");
          setShowParticles(true);
          setCardRevealed(true);
          playRevealFanfare(firstCard.rarity);
        }, 7800);
      } else {
        // No freeze for tier1 — go straight to reveal
        t(() => {
          setPhase("card-reveal");
          setShowParticles(true);
          setCardRevealed(true);
          playRevealFanfare(firstCard.rarity);
        }, 5800);
      }
    })();

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pullFromApi]);

  // Play sound on subsequent card reveals
  useEffect(() => {
    if (phase === "card-reveal" && currentCardIndex > 0 && pulledCards[currentCardIndex]) {
      setCardRevealed(false);
      setShowParticles(false);
      const timer = setTimeout(() => {
        playRevealFanfare(pulledCards[currentCardIndex].rarity);
        setShowParticles(true);
        setCardRevealed(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentCardIndex, phase, pulledCards]);

  const currentCard = pulledCards[currentCardIndex];
  const totalValue = pulledCards.reduce((sum, c) => sum + c.marketValue, 0);
  const sellBackValue = Math.floor(totalValue * 0.8);
  const costInCoins = pack.price * quantity;
  const currentConfig = currentCard ? RARITY_CONFIG[currentCard.rarity] : RARITY_CONFIG.tier1;

  // Dice color based on stage
  const DICE_STAGE_COLORS = ["#ffffff", "#ef4444", "#1a1a2e", "#f59e0b"];
  const DICE_STAGE_GLOW = ["rgba(255,255,255,0.2)", "rgba(239,68,68,0.5)", "rgba(100,50,200,0.5)", "rgba(245,158,11,0.7)"];
  const DICE_STAGE_TEXT = ["#333", "#fff", "#c084fc", "#000"];

  const handleKeepAll = () => { onKeepAll(pulledCards); setSettled(true); };
  const handleSellBack = () => { onSellBack(sellBackValue); setSettled(true); };
  const handleClose = () => {
    if (!settled && pulledCards.length > 0) onKeepAll(pulledCards);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        transform: screenShake ? `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)` : "none",
      }}
      onClick={(e) => e.target === e.currentTarget && phase === "result" && handleClose()}
    >
      {/* Background */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        phase === "freeze" ? "bg-black" :
        phase === "card-reveal" || phase === "result" ? `bg-gradient-to-b ${currentConfig.bgGradient}` :
        "bg-gradient-to-b from-gray-950 via-black to-gray-950"
      }`} />
      {phase !== "freeze" && <div className="absolute inset-0 bg-black/40" />}

      {/* White flash overlay */}
      <AnimatePresence>
        {flashWhite && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Close button (only in reveal/result) */}
      {(phase === "card-reveal" || phase === "result") && (
        <button onClick={handleClose} className="absolute top-4 right-4 text-white/40 hover:text-white z-20">
          <X className="h-6 w-6" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* ============ DICE PHASES ============ */}
        {(phase === "dice-rise" || phase === "dice-color" || phase === "dice-land") && !error && (
          <motion.div
            key="dice"
            className="relative flex flex-col items-center z-10"
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Vertical light beam behind dice */}
            <motion.div
              className="absolute w-1 rounded-full"
              style={{
                background: `linear-gradient(to top, transparent, ${DICE_STAGE_GLOW[diceColorStage]}, transparent)`,
                height: "400px",
                top: "-150px",
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                width: phase === "dice-land" ? "80px" : "2px",
              }}
              transition={{ opacity: { duration: 0.8, repeat: Infinity }, width: { duration: 0.2 } }}
            />

            {/* The 3 dice */}
            <div className="flex gap-4 relative">
              {[0, 1, 2].map((idx) => (
                <motion.div
                  key={idx}
                  className="relative"
                  animate={
                    phase === "dice-rise"
                      ? { y: [20, -30, 20], rotate: [0, 15, -15, 0] }
                      : phase === "dice-land"
                      ? { y: 0, rotate: 0, scale: [1.3, 1] }
                      : { y: [-10, 10, -10], rotate: [-5, 5, -5] }
                  }
                  transition={
                    phase === "dice-land"
                      ? { duration: 0.3 }
                      : { duration: 0.6 + idx * 0.1, repeat: Infinity, ease: "easeInOut" }
                  }
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold transition-all duration-300 relative"
                    style={{
                      backgroundColor: DICE_STAGE_COLORS[diceColorStage],
                      color: DICE_STAGE_TEXT[diceColorStage],
                      boxShadow: `0 0 30px ${DICE_STAGE_GLOW[diceColorStage]}, 0 0 60px ${DICE_STAGE_GLOW[diceColorStage]}`,
                      border: diceColorStage === 3 ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {diceSpinning ? (
                      <span className="animate-pulse">{DICE_FACES[diceValues[idx]]}</span>
                    ) : (
                      <motion.span
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1, type: "spring" }}
                      >
                        {DICE_FACES[diceValues[idx]]}
                      </motion.span>
                    )}

                    {/* Glow pulse on gold dice */}
                    {diceColorStage === 3 && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: "0 0 40px #f59e0b, 0 0 80px #f59e0b" }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Golden plate (visible on land) */}
            {phase === "dice-land" && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                className="mt-4 w-72 h-3 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.3), rgba(251,191,36,0.5), rgba(251,191,36,0.3), transparent)",
                }}
              />
            )}

            {/* Pack name */}
            <motion.p
              className="mt-8 text-white/50 text-sm font-medium"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {pack.name} × {quantity}
            </motion.p>

            {/* Dice result label on land */}
            {phase === "dice-land" && pulledCards[0] && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <span
                  className="text-sm font-black tracking-[0.2em] px-4 py-1.5 rounded-full"
                  style={{
                    color: currentConfig.color,
                    backgroundColor: `${currentConfig.color}20`,
                    border: `1px solid ${currentConfig.color}40`,
                    textShadow: `0 0 15px ${currentConfig.color}`,
                  }}
                >
                  {diceValues[0] === diceValues[1] && diceValues[1] === diceValues[2]
                    ? diceValues[0] === 0 ? "ピンゾロ！！！" : "ゾロ目！！"
                    : diceValues.includes(3) && diceValues.includes(4) && diceValues.includes(5)
                    ? "ジゴロ！"
                    : "..."
                  }
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ============ FREEZE (BLACKOUT) ============ */}
        {phase === "freeze" && (
          <motion.div
            key="freeze"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center"
          >
            <motion.div
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-white/20 text-sm tracking-[0.3em] font-bold"
            >
              . . .
            </motion.div>
          </motion.div>
        )}

        {/* ============ CARD REVEAL ============ */}
        {phase === "card-reveal" && currentCard && (
          <motion.div
            key={`reveal-${currentCardIndex}`}
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 150 }}
            className="relative flex flex-col items-center z-10 w-full max-w-sm px-4"
          >
            {/* Explosion particles */}
            {showParticles && (
              <Particles count={50} color={currentConfig.particleColor} spread={300} />
            )}

            {/* Massive background glow */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                width: "600px", height: "600px",
                background: `radial-gradient(circle, ${currentConfig.glowColor}, transparent 70%)`,
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1.2] }}
              transition={{ duration: 0.8 }}
            />

            {/* Rarity label */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-2 z-10"
            >
              <span
                className="text-sm font-black tracking-[0.2em] px-5 py-1.5 rounded-full"
                style={{
                  color: currentConfig.color,
                  backgroundColor: `${currentConfig.color}15`,
                  border: `1px solid ${currentConfig.color}50`,
                  textShadow: `0 0 25px ${currentConfig.color}`,
                }}
              >
                {currentConfig.label}
              </span>
            </motion.div>

            {/* Card counter */}
            <p className="text-xs text-white/30 mb-3 z-10">
              {currentCardIndex + 1} / {pulledCards.length}
            </p>

            {/* Card with dramatic entrance */}
            <motion.div
              className="relative z-10"
              initial={{ rotateY: 180, y: 100 }}
              animate={{
                rotateY: cardRevealed ? 0 : 180,
                y: cardRevealed ? 0 : 100,
              }}
              transition={{ type: "spring", damping: 12, stiffness: 120 }}
              style={{ perspective: 1000 }}
            >
              <div
                className="rounded-2xl p-[3px]"
                style={{
                  background: `linear-gradient(135deg, ${currentConfig.color}, ${currentConfig.color}33, ${currentConfig.color})`,
                  boxShadow: `0 0 40px ${currentConfig.glowColor}, 0 0 80px ${currentConfig.glowColor}`,
                }}
              >
                <div className="rounded-2xl bg-black/80 p-2">
                  <div className="h-80 w-56 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                    <CardImage src={currentCard.imageUrl} alt={currentCard.name} rarity={currentCard.rarity} size="lg" />
                  </div>
                </div>
              </div>

              {/* Continuous sparkles for tier3+ */}
              {(currentCard.rarity === "tier4" || currentCard.rarity === "tier3") && (
                <Sparkles color={currentConfig.particleColor} />
              )}
            </motion.div>

            {/* Card info */}
            <motion.div
              className="mt-4 text-center z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-white">{currentCard.name}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-black text-amber-400">
                  {formatNumber(currentCard.marketValue)}
                </span>
              </div>
            </motion.div>

            {/* Next / Results button */}
            <motion.div
              className="mt-6 z-10 w-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0 }}
              transition={{ delay: 0.5 }}
            >
              {currentCardIndex < pulledCards.length - 1 ? (
                <Button size="lg" className="w-full" onClick={() => setCurrentCardIndex((i) => i + 1)}>
                  Next Card ({currentCardIndex + 2}/{pulledCards.length})
                </Button>
              ) : (
                <Button size="lg" className="w-full" onClick={() => setPhase("result")}>
                  View Results
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ============ RESULT ============ */}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-4 w-full max-w-md z-10"
          >
            <motion.h2
              className="text-2xl font-black text-center mb-4"
              style={{ color: currentConfig.color, textShadow: `0 0 30px ${currentConfig.glowColor}` }}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              RESULTS
            </motion.h2>

            <div className="rounded-2xl bg-black/70 border border-white/10 backdrop-blur-lg p-4">
              <div className="space-y-2 max-h-56 overflow-y-auto mb-4 pr-1">
                {pulledCards.map((card, i) => {
                  const cfg = RARITY_CONFIG[card.rarity];
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-xl p-2.5"
                      style={{ backgroundColor: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-9 rounded-lg overflow-hidden flex-shrink-0">
                          <CardImage src={card.imageUrl} alt={card.name} size="sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{card.name}</p>
                          <p className="text-[10px] font-bold tracking-wider" style={{ color: cfg.color }}>
                            {cfg.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">{formatNumber(card.marketValue)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Value</span>
                  <span className="font-bold text-amber-400">{formatNumber(totalValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Cost</span>
                  <span className="text-white/70">{formatNumber(costInCoins)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Sell Back (80%)</span>
                  <span className="text-green-400">+{formatNumber(sellBackValue)}</span>
                </div>
              </div>

              {!settled ? (
                <div className="flex gap-3 mt-4">
                  <Button variant="secondary" className="flex-1" onClick={handleKeepAll}>Keep All</Button>
                  <Button className="flex-1" onClick={handleSellBack}>Sell Back (+{formatNumber(sellBackValue)})</Button>
                </div>
              ) : (
                <div className="mt-4 text-center space-y-3">
                  <motion.p className="text-sm font-medium text-green-400" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    Done!
                  </motion.p>
                  <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      {error && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-50"
        >
          <div className="mx-4 w-full max-w-md rounded-2xl bg-card border border-border p-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
