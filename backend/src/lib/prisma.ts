import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://activepdf:activepdf@localhost:5433/activepdf",
  });
  return new PrismaClient({
    adapter,
    // Nunca expor o hash de senha em queries; o login reabilita com omit: { password: false }
    omit: {
      professor: { password: true },
      student: { password: true },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
