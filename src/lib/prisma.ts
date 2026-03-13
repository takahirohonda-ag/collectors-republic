// Prisma client singleton with graceful fallback when DB is not connected

let prismaClient: ReturnType<typeof createPrismaClient> | null = null;

function createPrismaClient() {
  try {
    // Dynamic import at runtime to avoid build errors when generated client doesn't exist
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("../../src/generated/prisma/client");
    return new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
  } catch {
    return null;
  }
}

export function getPrisma() {
  if (!process.env.DATABASE_URL) return null;

  if (!prismaClient) {
    prismaClient = createPrismaClient();
  }
  return prismaClient;
}

export function isDbConnected(): boolean {
  return !!process.env.DATABASE_URL;
}
