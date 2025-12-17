// test/setup.ts
import { vi, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import {
  setupTestDatabase,
  teardownTestDatabase,
  getTestDatabaseHelper,
} from "./database-helpers";

// Mock matchMedia for @nuxtjs/color-mode
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeAll(async () => {
  // Set up test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./test.db";

  // Initialize test database
  await setupTestDatabase();
});

beforeEach(async () => {
  // Reset database before each test for isolation
  const dbHelper = getTestDatabaseHelper();
  await dbHelper.resetDatabase();
});

afterEach(async () => {
  // Clean up test data after each test
  const dbHelper = getTestDatabaseHelper();
  await dbHelper.cleanupTestData();
});

afterAll(async () => {
  // Teardown test database
  await teardownTestDatabase();
});
