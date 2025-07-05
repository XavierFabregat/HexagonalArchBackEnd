import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/repositories/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    database: process.env.DATABASE_NAME || 'hexagonal_tasks',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'xavi',
    password: process.env.DATABASE_PASSWORD || '12345',
  },
} satisfies Config;
