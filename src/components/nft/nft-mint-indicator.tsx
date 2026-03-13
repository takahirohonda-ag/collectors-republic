"use client";

import { motion } from "framer-motion";
import { Hexagon, Check, Loader2 } from "lucide-react";

interface NftMintIndicatorProps {
  status: "minting" | "minted" | "mock";
  txHash?: string;
}

export function NftMintIndicator({ status, txHash }: NftMintIndicatorProps) {
  if (status === "mock") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-2"
    >
      {status === "minting" ? (
        <>
          <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
          <span className="text-xs text-purple-400">Minting NFT on Polygon...</span>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-purple-500/20">
            <Check className="h-3 w-3 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-purple-400 font-medium">NFT Minted!</span>
            {txHash && (
              <a
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-purple-400/60 hover:text-purple-400 truncate max-w-[200px]"
              >
                View on Polygonscan →
              </a>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
