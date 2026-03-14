// Prisma client singleton with graceful fallback when DB is not connected
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaClient: any | null = null;
let initAttempted = false;

export function getPrisma() {
  if (!process.env.DATABASE_URL) return null;

  if (!initAttempted) {
    initAttempted = true;
    try {
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
      prismaClient = new (PrismaClient as any)({ adapter });
    } catch (e) {
      console.error("Prisma client init failed:", e);
      prismaClient = null;
    }
  }
  return prismaClient;
}

export function isDbConnected(): boolean {
  return !!process.env.DATABASE_URL;
}
