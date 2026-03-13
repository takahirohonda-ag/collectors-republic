import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 20) || "not set";

  let prismaStatus = "not attempted";
  let queryResult = "not attempted";
  let initError = "none";

  try {
    prismaStatus = "PrismaClient imported";
    const prisma = new (PrismaClient as any)({
      datasourceUrl: process.env.DATABASE_URL,
    });
    prismaStatus = "initialized";
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
