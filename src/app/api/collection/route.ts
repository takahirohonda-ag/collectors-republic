import { NextResponse } from "next/server";

/**
 * GET /api/collection — returns user's card collection
 * POST /api/collection/sell-back — sell a card back for 80% value
 *
 * Currently returns mock data. Will connect to Prisma/Supabase when DB is ready.
 */
export async function GET() {
  // TODO: Get user from session, query their collection from DB
  return NextResponse.json({
    collection: [],
    message: "Connect Supabase to load real collection data",
  });
}
