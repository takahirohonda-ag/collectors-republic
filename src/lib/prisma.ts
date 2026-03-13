// Prisma client singleton with graceful fallback when DB is not connected
import { PrismaClient } from "@/generated/prisma/client";

let prismaClient: InstanceType<typeof PrismaClient> | null = null;
let initAttempted = false;

export function getPrisma() {
  if (!process.env.DATABASE_URL) return null;

  if (!initAttempted) {
    initAttempted = true;
    try {
      prismaClient = new (PrismaClient as any)({
        datasourceUrl: process.env.DATABASE_URL,
      });
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
