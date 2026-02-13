import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import { createAuditedPrisma } from './audit/audited-prisma.ts';
import { logger } from './utils/logger.ts';
import { env } from '../config/env.ts';

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const basePrisma = new PrismaClient({ adapter });

// The extended client adds audit interceptors but has the same interface at runtime.
// Cast back to PrismaClient so all repositories accept it without type changes.
const prisma = createAuditedPrisma(basePrisma) as unknown as PrismaClient;

export { prisma, basePrisma };

export async function disconnectDatabase(): Promise<void> {
  logger.info('Disconnecting from database');
  await basePrisma.$disconnect();
  await pool.end();
}
