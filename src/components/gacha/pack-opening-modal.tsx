"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, GachaPack, CardRarity } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardImage } from "@/components/ui/card-image";
import { EffectsCanvas, EffectMode } from "./effects-canvas";
import { Sparkles } from "./particles";
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

type Phase = "buildup" | "peak" | "blackout" | "reveal" | "result";

const RARITY_COLORS: Record<CardRarity, { primary: string; secondary: string; label: string }> = {
  tier1: { primary: "#10b981", secondary: "#34d399", label: "COMMON" },
  tier2: { primary: "#6366f1", secondary: "#818cf8", label: "RARE" },
  tier3: { primary: "#d946ef", secondary: "#f0abfc", label: "ULTRA RARE" },
  tier4: { primary: "#f59e0b", secondary: "#fcd34d", label: "LEGENDARY" },
};

function getRarityIndex(r: CardRarity) { return { tier1: 0, tier2: 1, tier3: 2, tier4: 3 }[r]; }

// Color stages for buildup: green → blue → purple → gold
const STAGE_COLORS = [
  { primary: "#10b981", secondary: "#34d399" },
  { primary: "#6366f1", secondary: "#818cf8" },
  { primary: "#d946ef", secondary: "#f0abfc" },
  { primary: "#f59e0b", secondary: "#fcd34d" },
];

export function PackOpeningModal({
  pack, quantity, onClose, onKeepAll, onSellBack,
}: PackOpeningModalProps) {
  const [phase, setPhase] = useState<Phase>("buildup");
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [effectMode, setEffectMode] = useState<EffectMode>("charge");
  const [effectColor, setEffectColor] = useState("#10b981");
  const [effectSecondary, setEffectSecondary] = useState("#34d399");
  const [effectIntensity, setEffectIntensity] = useState(0.5);
  const [colorStage, setColorStage] = useState(0);
  const [bgStyle, setBgStyle] = useState("bg-black");
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [showText, setShowText] = useState("");

  const initRef = useRef(false);

  const flash = useCallback((color: string, duration = 150) => {
    setScreenFlash(color);
    setTimeout(() => setScreenFlash(null), duration);
  }, []);

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

  // === MAIN CINEMATIC SEQUENCE ===
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => { timers.push(setTimeout(fn, ms)); };

    (async () => {
      const pullPromise = pullFromApi();

      // --- BUILDUP (0-4s): Energy charging, キュイーン ---
      playKyuiin(3.5);
      setEffectMode("charge");
      setEffectIntensity(0.3);
      setBgStyle("bg-black");

      // Gradually increase intensity
      t(() => setEffectIntensity(0.5), 500);
      t(() => setEffectIntensity(0.7), 1000);
      t(() => setEffectIntensity(0.9), 1500);

      // Get cards result
      const cards = await pullPromise;
      if (!cards || cards.length === 0) return;
      setPulledCards(cards);

      const rarity = cards[0].rarity;
      const targetStage = getRarityIndex(rarity);
      const rc = RARITY_COLORS[rarity];

      // --- COLOR UPGRADES (2-3.5s): Each upgrade = flash + sound ---
      const upgradeStart = 2000;
      for (let i = 0; i <= targetStage; i++) {
        t(() => {
          setColorStage(i);
          setEffectColor(STAGE_COLORS[i].primary);
          setEffectSecondary(STAGE_COLORS[i].secondary);
          if (i > 0) {
            playColorUpgrade();
            flash(STAGE_COLORS[i].primary, 120);
            setEffectMode("intensify");
          }
          setShowText(i === 0 ? "" : i === 1 ? "!" : i === 2 ? "!!" : "!!!");
        }, upgradeStart + i * 400);
      }

      // --- PEAK (3.5-4.5s): Everything maxed ---
      t(() => {
        setEffectMode("climax");
        setEffectIntensity(1);
        setShowText("");
        playKyuiin(0.8); // Short final kyuiin
      }, 3500);

      // --- IMPACT (4.5s): Screen flash + heavy sound ---
      t(() => {
        playDiceImpact();
        flash("#ffffff", 200);
        setEffectMode("idle");
      }, 4300);

      // --- BLACKOUT for tier2+ (4.8-7s) ---
      if (targetStage >= 1) {
        t(() => {
          setPhase("blackout");
          setEffectMode("blackout");
          setEffectIntensity(1);
          playFreeze();
          setBgStyle("bg-black");
        }, 4800);

        // Heartbeats in darkness
        t(() => playHeartbeat(), 5400);
        t(() => playHeartbeat(), 6100);

        // Longer blackout for higher rarity
        const blackoutEnd = targetStage >= 3 ? 7200 : targetStage >= 2 ? 6800 : 6300;

        // --- REVIVAL + CARD REVEAL ---
        t(() => {
          playRevival();
          flash(rc.primary, 250);
          setEffectColor(rc.primary);
          setEffectSecondary(rc.secondary);
          setEffectMode("explode");
          setEffectIntensity(1);
          setBgStyle("bg-black");

          setTimeout(() => {
            setPhase("reveal");
            setCardRevealed(true);
            playRevealFanfare(rarity);
            setEffectMode("shimmer");
            setEffectIntensity(0.8);
          }, 500);
        }, blackoutEnd);
      } else {
        // tier1: quick transition to reveal
        t(() => {
          setEffectColor(rc.primary);
          setEffectSecondary(rc.secondary);
          setEffectMode("explode");
          flash("#ffffff", 150);
          setTimeout(() => {
            setPhase("reveal");
            setCardRevealed(true);
            playRevealFanfare(rarity);
            setEffectMode("shimmer");
            setEffectIntensity(0.6);
          }, 400);
        }, 5000);
      }
    })();

    return () => timers.forEach(clearTimeout);
  }, [pullFromApi, flash]);

  // Sound on subsequent card reveals
  useEffect(() => {
    if (phase === "reveal" && currentCardIndex > 0 && pulledCards[currentCardIndex]) {
      setCardRevealed(false);
      const card = pulledCards[currentCardIndex];
      const rc = RARITY_COLORS[card.rarity];
      setEffectColor(rc.primary);
      setEffectSecondary(rc.secondary);
      setEffectMode("explode");
      flash(rc.primary, 150);
      const timer = setTimeout(() => {
        setCardRevealed(true);
        playRevealFanfare(card.rarity);
        setEffectMode("shimmer");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentCardIndex, phase, pulledCards, flash]);

  const currentCard = pulledCards[currentCardIndex];
  const totalValue = pulledCards.reduce((sum, c) => sum + c.marketValue, 0);
  const sellBackValue = Math.floor(totalValue * 0.8);
  const costInCoins = pack.price * quantity;
  const rc = currentCard ? RARITY_COLORS[currentCard.rarity] : RARITY_COLORS.tier1;

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
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${bgStyle}`}
      onClick={(e) => e.target === e.currentTarget && phase === "result" && handleClose()}
    >
      {/* Canvas effects layer */}
      <EffectsCanvas
        mode={effectMode}
        color={effectColor}
        secondaryColor={effectSecondary}
        intensity={effectIntensity}
      />

      {/* Screen flash overlay */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ backgroundColor: screenFlash }}
          />
        )}
      </AnimatePresence>

      {/* Close button */}
      {(phase === "reveal" || phase === "result") && (
        <button onClick={handleClose} className="absolute top-4 right-4 text-white/30 hover:text-white z-30">
          <X className="h-6 w-6" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* ============ BUILDUP + PEAK ============ */}
        {(phase === "buildup" || phase === "peak") && !error && (
          <motion.div
            key="buildup"
            className="relative z-20 flex flex-col items-center"
            exit={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.2 }}
          >
            {/* Central energy orb */}
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5 + (1 - effectIntensity) * 0.5, repeat: Infinity }}
            >
              <div
                className="w-28 h-28 rounded-full transition-all duration-300"
                style={{
                  background: `radial-gradient(circle, ${effectColor}, ${effectColor}88 40%, transparent 70%)`,
                  boxShadow: `0 0 ${60 + effectIntensity * 60}px ${effectColor}, 0 0 ${120 + effectIntensity * 80}px ${effectColor}66`,
                }}
              />
              {/* Inner core */}
              <div
                className="absolute inset-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, white, ${effectColor} 60%, transparent)`,
                  opacity: 0.6 + effectIntensity * 0.4,
                }}
              />
            </motion.div>

            {/* Color upgrade text */}
            <AnimatePresence mode="wait">
              {showText && (
                <motion.div
                  key={showText}
                  initial={{ scale: 3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="absolute text-6xl font-black"
                  style={{
                    color: effectColor,
                    textShadow: `0 0 40px ${effectColor}, 0 0 80px ${effectColor}`,
                  }}
                >
                  {showText}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pack info */}
            <motion.p
              className="mt-10 text-white/40 text-sm tracking-wide"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {pack.name}
            </motion.p>
          </motion.div>
        )}

        {/* ============ BLACKOUT ============ */}
        {phase === "blackout" && (
          <motion.div
            key="blackout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-20 flex items-center justify-center"
          >
            <motion.div
              animate={{ opacity: [0, 0.3, 0], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-white/10 text-2xl font-bold tracking-[0.5em]"
            >
              ・・・
            </motion.div>
          </motion.div>
        )}

        {/* ============ CARD REVEAL ============ */}
        {phase === "reveal" && currentCard && (
          <motion.div
            key={`reveal-${currentCardIndex}`}
            initial={{ scale: 0.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 8, stiffness: 100 }}
            className="relative flex flex-col items-center z-20 w-full max-w-sm px-4"
          >
            {/* Rarity label */}
            <motion.div
              initial={{ y: -40, opacity: 0, scale: 2 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-3"
            >
              <span
                className="text-sm font-black tracking-[0.25em] px-6 py-2 rounded-full inline-block"
                style={{
                  color: rc.primary,
                  backgroundColor: `${rc.primary}18`,
                  border: `2px solid ${rc.primary}60`,
                  textShadow: `0 0 30px ${rc.primary}`,
                  boxShadow: `0 0 20px ${rc.primary}30`,
                }}
              >
                {rc.label}
              </span>
            </motion.div>

            <p className="text-xs text-white/25 mb-2">{currentCardIndex + 1} / {pulledCards.length}</p>

            {/* The card */}
            <motion.div
              className="relative"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: cardRevealed ? 0 : 90 }}
              transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.1 }}
              style={{ perspective: 1200 }}
            >
              <div
                className="rounded-2xl p-[3px]"
                style={{
                  background: `linear-gradient(135deg, ${rc.primary}, ${rc.secondary}, ${rc.primary})`,
                  boxShadow: `0 0 50px ${rc.primary}80, 0 0 100px ${rc.primary}40`,
                }}
              >
                <div className="rounded-2xl bg-black/85 p-2.5">
                  <div className="h-80 w-56 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-900/80 to-black">
                    <CardImage src={currentCard.imageUrl} alt={currentCard.name} rarity={currentCard.rarity} size="lg" />
                  </div>
                </div>
              </div>
              {(currentCard.rarity === "tier4" || currentCard.rarity === "tier3") && (
                <Sparkles color={rc.secondary} />
              )}
            </motion.div>

            {/* Card name + value */}
            <motion.div
              className="mt-4 text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-xl font-bold text-white">{currentCard.name}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <motion.span
                  className="text-3xl font-black text-amber-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: cardRevealed ? 1 : 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {formatNumber(currentCard.marketValue)}
                </motion.span>
              </div>
            </motion.div>

            {/* Next button */}
            <motion.div
              className="mt-6 w-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: cardRevealed ? 1 : 0 }}
              transition={{ delay: 0.6 }}
            >
              {currentCardIndex < pulledCards.length - 1 ? (
                <Button size="lg" className="w-full" onClick={() => setCurrentCardIndex((i) => i + 1)}>
                  Next Card ({currentCardIndex + 2}/{pulledCards.length})
                </Button>
              ) : (
                <Button size="lg" className="w-full" onClick={() => { setPhase("result"); setEffectMode("idle"); }}>
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
            className="mx-4 w-full max-w-md z-20"
          >
            <h2 className="text-2xl font-black text-center mb-4 text-white">RESULTS</h2>

            <div className="rounded-2xl bg-black/80 border border-white/10 backdrop-blur-lg p-4">
              <div className="space-y-2 max-h-56 overflow-y-auto mb-4 pr-1">
                {pulledCards.map((card, i) => {
                  const c = RARITY_COLORS[card.rarity];
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-xl p-2.5"
                      style={{ backgroundColor: `${c.primary}0a`, border: `1px solid ${c.primary}25` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-9 rounded-lg overflow-hidden flex-shrink-0">
                          <CardImage src={card.imageUrl} alt={card.name} size="sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{card.name}</p>
                          <p className="text-[10px] font-bold tracking-wider" style={{ color: c.primary }}>{c.label}</p>
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
                  <p className="text-sm font-medium text-green-400">Done!</p>
                  <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex items-center justify-center z-50">
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
