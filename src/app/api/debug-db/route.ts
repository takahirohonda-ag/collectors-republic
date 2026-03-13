import { NextResponse } from "next/server";

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 20) || "not set";

  let prismaStatus = "not attempted";
  let queryResult = "not attempted";
  let initError = "none";

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@/generated/prisma");
    const { PrismaClient } = mod;
    prismaStatus = `module loaded, keys: ${Object.keys(mod).slice(0, 5).join(",")}`;
    const prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
    const count = await prisma.user.count();
    queryResult = `success: ${count} users`;
    await prisma.$disconnect();
  } catch (e: unknown) {
    const err = e as Error;
    initError = `${err.name}: ${err.message}`;
  }

  return NextResponse.json({
    hasDbUrl,
    dbUrlPrefix,
    prismaStatus,
    queryResult,
    initError,
    nodeEnv: process.env.NODE_ENV,
  });
}
