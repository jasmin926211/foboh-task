import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'src/prisma/schema.prisma',
  migrations: {
    path: 'src/prisma/migrations',
    seed: 'npx ts-node --compiler-options {"module":"CommonJS","types":["node"]} src/prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
