import "server-only";
import { PrismaClient } from "@prisma/client";

// Server-only Prisma singleton (avoids exhausting connections during dev HMR).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
