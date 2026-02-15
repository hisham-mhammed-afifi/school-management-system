import { defineConfig } from 'prisma/config';

// Prisma CLI natively reads .env files, no need for dotenv
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
