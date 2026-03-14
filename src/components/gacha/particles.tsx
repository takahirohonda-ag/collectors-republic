"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
  color?: string;
  spread?: number;
}

export function Particles({ count = 30, color = "#f59e0b", spread = 200 }: ParticlesProps) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i / count) * 360,
      distance: spread * (0.5 + Math.random() * 0.5),
      size: 3 + Math.random() * 6,
      duration: 0.6 + Math.random() * 0.8,
      delay: Math.random() * 0.2,
    })),
    [count, spread]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: color,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              boxShadow: `0 0 ${p.size * 2}px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

/** Sparkle overlay that loops */
export function Sparkles({ color = "#fbbf24" }: { color?: string }) {
  const sparkles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1,
    })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            backgroundColor: color,
            boxShadow: `0 0 ${s.size * 3}px ${color}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
