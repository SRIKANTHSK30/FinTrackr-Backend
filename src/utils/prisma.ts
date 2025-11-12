import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
// @ts-ignore
const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
