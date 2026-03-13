"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CardRarity } from "@/types";

interface CardImageProps {
  src: string;
  alt: string;
  rarity?: CardRarity;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const rarityGlow: Record<CardRarity, string> = {
  tier1: "shadow-green-500/20",
  tier2: "shadow-blue-500/30",
  tier3: "shadow-purple-500/40",
  tier4: "shadow-amber-500/50",
};

export function CardImage({ src, alt, rarity, className, size = "md" }: CardImageProps) {
  const [error, setError] = useState(false);

  const sizeClass = {
    sm: "h-24 w-auto",
    md: "h-40 w-auto",
    lg: "h-64 w-auto",
  }[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg",
        rarity && `shadow-lg ${rarityGlow[rarity]}`,
        className
      )}
    >
      {!error ? (
        <Image
          src={src}
          alt={alt}
          width={size === "sm" ? 100 : size === "md" ? 160 : 240}
          height={size === "sm" ? 140 : size === "md" ? 224 : 336}
          className={cn("object-contain", sizeClass)}
          onError={() => setError(true)}
          unoptimized
        />
      ) : (
        <div className={cn("flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg", sizeClass, "w-full aspect-[3/4]")}>
          <span className="text-3xl">🃏</span>
        </div>
      )}
    </div>
  );
}
