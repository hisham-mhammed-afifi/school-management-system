import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import { logger } from './utils/logger.ts';
import { env } from '../config/env.ts';

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };

export async function disconnectDatabase(): Promise<void> {
  logger.info('Disconnecting from database');
  await prisma.$disconnect();
  await pool.end();
}
