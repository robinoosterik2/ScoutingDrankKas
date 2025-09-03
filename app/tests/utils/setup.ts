// test/setup.ts
// Prisma + SQLite: nothing to start/stop; db resets can be done per test if needed.
import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(async () => {
  // Ensure DATABASE_URL is set for Prisma
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
});

afterEach(async () => {
  // Optionally truncate tables between tests using Prisma if necessary.
});

afterAll(async () => {
  // No teardown required for SQLite file DB used in tests.
});
