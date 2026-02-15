import path from 'node:path';
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'prisma/config';

// Load .env file so DATABASE_URL is available for CLI commands (migrate, push, etc.)
try {
  loadEnvFile(path.resolve('.env'));
} catch {
  // .env may not exist in CI/production where env vars are set directly
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
