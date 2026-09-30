import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { withVerifiedTls } from "@/lib/db-url";
import { env } from "@/lib/env";

// Um cliente por processo. No dev, o hot reload recriaria o cliente a cada mudança,
// então ele fica guardado no globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: withVerifiedTls(env.DATABASE_URL) });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
