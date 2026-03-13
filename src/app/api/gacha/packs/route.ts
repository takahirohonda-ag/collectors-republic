import { NextResponse } from "next/server";
import { gachaPacks } from "@/data/mock";

/**
 * Returns available gacha packs with probabilities.
 * Does NOT include cardsInPack to prevent client from knowing the full card pool.
 */
export async function GET() {
  const packs = gachaPacks.map(({ cardsInPack, ...rest }) => rest);
  return NextResponse.json({ packs });
}
