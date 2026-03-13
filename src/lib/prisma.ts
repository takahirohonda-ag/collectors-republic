// Prisma client singleton with graceful fallback when DB is not connected

let prismaClient: InstanceType<typeof import("@/generated/prisma").PrismaClient> | null = null;
let initAttempted = false;

export function getPrisma() {
  if (!process.env.DATABASE_URL) return null;

  if (!initAttempted) {
    initAttempted = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaClient } = require("@/generated/prisma");
      prismaClient = new PrismaClient({
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
