import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Server-only: nunca importar este módulo de um arquivo que o cliente carrega.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida (veja .env.example)");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    // Nunca expor o hash de senha em queries; login reabilita com omit: { password: false }
    omit: { user: { password: true } },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;