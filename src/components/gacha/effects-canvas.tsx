"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
}

interface Ray {
  angle: number;
  width: number;
  length: number;
  color: string;
  speed: number;
  alpha: number;
}

interface SpeedLine {
  angle: number;
  offset: number;
  length: number;
  alpha: number;
  speed: number;
}

export type EffectMode =
  | "idle"
  | "charge"       // Building energy — swirling particles, pulsing glow
  | "intensify"    // Color upgrades — speed lines, flash
  | "climax"       // Peak tension — everything goes crazy
  | "blackout"     // Screen goes dark
  | "explode"      // Final explosion — particles everywhere
  | "shimmer";     // Card reveal — gentle sparkles

interface EffectsCanvasProps {
  mode: EffectMode;
  color: string;         // Primary effect color
  secondaryColor?: string;
  intensity?: number;    // 0-1 scale
  className?: string;
}

export function EffectsCanvas({
  mode,
  color,
  secondaryColor,
  intensity = 1,
  className = "",
}: EffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rays = useRef<Ray[]>([]);
  const speedLines = useRef<SpeedLine[]>([]);
  const animFrame = useRef<number>(0);
  const timeRef = useRef(0);
  const prevMode = useRef<EffectMode>("idle");

  const spawnParticles = useCallback((
    cx: number, cy: number, count: number, col: string,
    spread = 5, sizeRange = [2, 6], decayRange = [0.01, 0.03]
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = spread * (0.5 + Math.random());
      particles.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        color: col,
        alpha: 1,
        decay: decayRange[0] + Math.random() * (decayRange[1] - decayRange[0]),
        life: 1,
      });
    }
  }, []);

  const spawnRays = useCallback((count: number, col: string) => {
    rays.current = [];
    for (let i = 0; i < count; i++) {
      rays.current.push({
        angle: (i / count) * Math.PI * 2,
        width: 2 + Math.random() * 8,
        length: 0.3 + Math.random() * 0.7,
        color: col,
        speed: 0.5 + Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }
  }, []);

  const spawnSpeedLines = useCallback((count: number) => {
    speedLines.current = [];
    for (let i = 0; i < count; i++) {
      speedLines.current.push({
        angle: Math.random() * Math.PI * 2,
        offset: 0.3 + Math.random() * 0.5,
        length: 0.1 + Math.random() * 0.3,
        alpha: 0.2 + Math.random() * 0.6,
        speed: 2 + Math.random() * 4,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const t = timeRef.current;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, w, h);

      // Mode changed — trigger effects
      if (mode !== prevMode.current) {
        prevMode.current = mode;
        if (mode === "charge") {
          spawnRays(12, color);
        }
        if (mode === "intensify") {
          spawnSpeedLines(40);
          spawnParticles(cx, cy, 30, color, 3);
        }
        if (mode === "climax") {
          spawnRays(24, color);
          spawnSpeedLines(80);
          spawnParticles(cx, cy, 60, color, 6, [3, 10]);
        }
        if (mode === "explode") {
          spawnParticles(cx, cy, 150, color, 12, [3, 12], [0.005, 0.015]);
          if (secondaryColor) {
            spawnParticles(cx, cy, 80, secondaryColor, 10, [2, 8], [0.008, 0.02]);
          }
          spawnRays(36, color);
        }
      }

      // === BACKGROUND EFFECTS ===

      if (mode === "charge") {
        // Pulsing radial gradient
        const pulse = 0.5 + Math.sin(t * 3) * 0.2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
        grad.addColorStop(0, hexToRgba(color, 0.3 * pulse * intensity));
        grad.addColorStop(0.5, hexToRgba(color, 0.1 * pulse * intensity));
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Swirling particles
        if (Math.random() < 0.3 * intensity) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 100 + Math.random() * 150;
          spawnParticles(
            cx + Math.cos(angle) * dist,
            cy + Math.sin(angle) * dist,
            1, color, 1, [1, 4], [0.008, 0.02]
          );
        }
      }

      if (mode === "intensify" || mode === "climax") {
        // Intense central glow
        const pulse = 0.7 + Math.sin(t * 5) * 0.3;
        const size = mode === "climax" ? 0.8 : 0.5;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * size);
        grad.addColorStop(0, hexToRgba(color, 0.5 * pulse * intensity));
        grad.addColorStop(0.3, hexToRgba(color, 0.2 * pulse * intensity));
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Continuous particle spawning
        if (Math.random() < 0.5 * intensity) {
          const angle = Math.random() * Math.PI * 2;
          const dist = mode === "climax" ? 50 + Math.random() * 80 : 80 + Math.random() * 120;
          spawnParticles(
            cx + Math.cos(angle) * dist,
            cy + Math.sin(angle) * dist,
            2, Math.random() > 0.5 ? color : (secondaryColor || color),
            2, [2, 6], [0.01, 0.025]
          );
        }
      }

      if (mode === "blackout") {
        ctx.fillStyle = `rgba(0,0,0,${0.95 * intensity})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (mode === "explode") {
        // Massive flash then glow
        const flashT = Math.max(0, 1 - t * 2);
        if (flashT > 0) {
          ctx.fillStyle = `rgba(255,255,255,${flashT * 0.8})`;
          ctx.fillRect(0, 0, w, h);
        }
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
        grad.addColorStop(0, hexToRgba(color, 0.4 * intensity));
        grad.addColorStop(0.4, hexToRgba(color, 0.15 * intensity));
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      if (mode === "shimmer") {
        // Gentle glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5);
        const pulse = 0.5 + Math.sin(t * 2) * 0.15;
        grad.addColorStop(0, hexToRgba(color, 0.2 * pulse));
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Random sparkles
        if (Math.random() < 0.2) {
          const sx = Math.random() * w;
          const sy = Math.random() * h;
          spawnParticles(sx, sy, 1, color, 0.5, [1, 3], [0.02, 0.04]);
        }
      }

      // === LIGHT RAYS ===
      if (mode !== "blackout" && mode !== "idle") {
        for (const ray of rays.current) {
          const a = ray.angle + t * ray.speed * 0.1;
          const len = Math.max(w, h) * ray.length;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(a);
          const rGrad = ctx.createLinearGradient(0, 0, len, 0);
          rGrad.addColorStop(0, hexToRgba(ray.color, ray.alpha * intensity * 0.7));
          rGrad.addColorStop(1, "transparent");
          ctx.fillStyle = rGrad;
          ctx.beginPath();
          ctx.moveTo(0, -ray.width / 2);
          ctx.lineTo(len, -ray.width * 0.1);
          ctx.lineTo(len, ray.width * 0.1);
          ctx.lineTo(0, ray.width / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // === SPEED LINES ===
      if (mode === "intensify" || mode === "climax") {
        ctx.strokeStyle = `rgba(255,255,255,${0.15 * intensity})`;
        ctx.lineWidth = 1;
        for (const line of speedLines.current) {
          const a = line.angle;
          line.offset -= 0.01 * line.speed;
          if (line.offset < 0) line.offset += 1;
          const maxR = Math.max(w, h) * 0.8;
          const r1 = line.offset * maxR;
          const r2 = (line.offset + line.length) * maxR;
          ctx.globalAlpha = line.alpha * intensity * (mode === "climax" ? 1 : 0.5);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // === PARTICLES ===
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 3;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrame.current = requestAnimationFrame(render);
    };

    // Reset time on mode change
    timeRef.current = 0;
    animFrame.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener("resize", resize);
    };
  }, [mode, color, secondaryColor, intensity, spawnParticles, spawnRays, spawnSpeedLines]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
