import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 20) || "not set";

  let prismaStatus = "not attempted";
  let queryResult = "not attempted";

  const prisma = getPrisma();

  if (prisma) {
    prismaStatus = "initialized";
    try {
      const count = await prisma.user.count();
      queryResult = `success: ${count} users`;
    } catch (e: unknown) {
      const err = e as Error;
      queryResult = `query error: ${err.message}`;
    }
  } else {
    prismaStatus = "null (failed or no DATABASE_URL)";
  }

  return NextResponse.json({
    hasDbUrl,
    dbUrlPrefix,
    prismaStatus,
    queryResult,
    nodeEnv: process.env.NODE_ENV,
  });
}
