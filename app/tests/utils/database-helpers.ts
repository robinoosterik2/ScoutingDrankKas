import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { randomBytes } from "crypto";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export interface DatabaseTestHelper {
  resetDatabase(): Promise<void>;
  seedTestData(fixtures: any): Promise<void>;
  cleanupTestData(): Promise<void>;
  createTestTransaction(): Promise<any>;
  rollbackTransaction(transaction: any): Promise<void>;
  getTestPrismaClient(): PrismaClient;
  closeConnection(): Promise<void>;
}

class DatabaseTestHelperImpl implements DatabaseTestHelper {
  private prisma: PrismaClient;
  private testDbPath: string;

  constructor() {
    // Create unique test database for each test run
    const testId = randomBytes(8).toString("hex");
    this.testDbPath = join(process.cwd(), `test-${testId}.db`);

    // Set test database URL
    process.env.DATABASE_URL = `file:${this.testDbPath}`;

    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL,
    });

    this.prisma = new PrismaClient({ adapter });
  }

  async resetDatabase(): Promise<void> {
    try {
      // Close existing connection
      await this.prisma.$disconnect();

      // Remove existing test database file if it exists
      if (existsSync(this.testDbPath)) {
        unlinkSync(this.testDbPath);
      }

      // Update environment variable for this process
      process.env.DATABASE_URL = `file:${this.testDbPath}`;

      const adapter = new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL,
      });

      // Create new Prisma client with test database
      this.prisma = new PrismaClient({ adapter });

      await this.prisma.$connect();

      // Create schema directly using SQL from migration
      await this.createSchema();
    } catch (error) {
      console.error("Failed to reset test database:", error);
      throw error;
    }
  }

  private async createSchema(): Promise<void> {
    // Create tables using the SQL from the migration file
    const schemaSql = `
      -- CreateTable
      CREATE TABLE "User" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "email" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "loggedInAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "balance" INTEGER NOT NULL DEFAULT 0,
          "resetPasswordToken" TEXT,
          "resetPasswordExpires" DATETIME,
          "roleId" INTEGER,
          "settingsId" INTEGER,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CustomRole" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          CONSTRAINT "User_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      -- CreateTable
      CREATE TABLE "CustomRole" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "roleName" TEXT NOT NULL,
          "roleDescription" TEXT NOT NULL,
          "rolePermissions" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      -- CreateTable
      CREATE TABLE "Settings" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "language" TEXT NOT NULL DEFAULT 'nl',
          "darkMode" BOOLEAN NOT NULL DEFAULT true,
          "speedMode" BOOLEAN NOT NULL DEFAULT false
      );

      -- CreateTable
      CREATE TABLE "Category" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "name" TEXT NOT NULL,
          "ageRestriction" BOOLEAN NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      -- CreateTable
      CREATE TABLE "Product" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "price" INTEGER NOT NULL,
          "ageRestriction" BOOLEAN NOT NULL DEFAULT false,
          "stock" INTEGER NOT NULL DEFAULT 0,
          "packSize" INTEGER,
          "imageUrl" TEXT NOT NULL DEFAULT '/images/placeholder.jpg',
          "totalOrders" INTEGER NOT NULL DEFAULT 0,
          "totalQuantitySold" INTEGER NOT NULL DEFAULT 0,
          "recentOrders" TEXT,
          "popularityScore" REAL NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      -- CreateTable
      CREATE TABLE "ProductOnCategory" (
          "productId" INTEGER NOT NULL,
          "categoryId" INTEGER NOT NULL,

          PRIMARY KEY ("productId", "categoryId"),
          CONSTRAINT "ProductOnCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "ProductOnCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      -- CreateTable
      CREATE TABLE "Order" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER NOT NULL,
          "bartenderId" INTEGER,
          "total" INTEGER NOT NULL,
          "dayOfOrder" DATETIME NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "Order_bartenderId_fkey" FOREIGN KEY ("bartenderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      -- CreateTable
      CREATE TABLE "OrderItem" (
          "orderId" INTEGER NOT NULL,
          "productId" INTEGER NOT NULL,
          "count" INTEGER NOT NULL,

          PRIMARY KEY ("orderId", "productId"),
          CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      -- CreateTable
      CREATE TABLE "Raise" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER NOT NULL,
          "raiserId" INTEGER,
          "amount" INTEGER NOT NULL,
          "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
          "dayOfOrder" DATETIME NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "Raise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "Raise_raiserId_fkey" FOREIGN KEY ("raiserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      -- CreateTable
      CREATE TABLE "Log" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "executorId" INTEGER,
          "action" TEXT NOT NULL,
          "level" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "targetType" TEXT NOT NULL,
          "targetId" INTEGER,
          "snapshot" TEXT,
          "changes" TEXT,
          "description" TEXT NOT NULL,
          "metadata" TEXT,
          "retentionUntil" DATETIME,
          "tags" TEXT,
          "severity" TEXT,
          "containsSensitiveData" BOOLEAN NOT NULL DEFAULT false,
          "archived" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "Log_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      -- CreateIndex
      CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

      -- CreateIndex
      CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

      -- CreateIndex
      CREATE UNIQUE INDEX "CustomRole_roleName_key" ON "CustomRole"("roleName");

      -- CreateIndex
      CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

      -- CreateIndex
      CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
    `;

    // Split and execute each statement
    const statements = schemaSql
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await this.prisma.$executeRawUnsafe(statement.trim() + ";");
      }
    }
  }

  async seedTestData(fixtures: any): Promise<void> {
    try {
      // Seed in proper order to respect foreign key constraints

      // Helper function to safely create data
      const safeCreate = async (operation: () => Promise<any>) => {
        try {
          return await operation();
        } catch (error: any) {
          // Ignore table not found errors (P2021)
          if (error.code !== "P2021") {
            throw error;
          }
        }
      };

      // 1. Create settings first
      if (fixtures.settings) {
        for (const setting of fixtures.settings) {
          await safeCreate(() =>
            this.prisma.settings.create({ data: setting })
          );
        }
      }

      // 2. Create custom roles
      if (fixtures.customRoles) {
        for (const role of fixtures.customRoles) {
          await safeCreate(() => this.prisma.customRole.create({ data: role }));
        }
      }

      // 3. Create users
      if (fixtures.users) {
        for (const user of fixtures.users) {
          await safeCreate(() => this.prisma.user.create({ data: user }));
        }
      }

      // 4. Create categories
      if (fixtures.categories) {
        for (const category of fixtures.categories) {
          await safeCreate(() =>
            this.prisma.category.create({ data: category })
          );
        }
      }

      // 5. Create products
      if (fixtures.products) {
        for (const product of fixtures.products) {
          await safeCreate(() => this.prisma.product.create({ data: product }));
        }
      }

      // 6. Create product-category relationships
      if (fixtures.productCategories) {
        for (const relation of fixtures.productCategories) {
          await safeCreate(() =>
            this.prisma.productOnCategory.create({ data: relation })
          );
        }
      }

      // 7. Create orders
      if (fixtures.orders) {
        for (const order of fixtures.orders) {
          await safeCreate(() =>
            this.prisma.order.create({
              data: {
                ...order,
                items: {
                  create: order.items || [],
                },
              },
            })
          );
        }
      }

      // 8. Create raises
      if (fixtures.raises) {
        for (const raise of fixtures.raises) {
          await safeCreate(() => this.prisma.raise.create({ data: raise }));
        }
      }

      // 9. Create logs
      if (fixtures.logs) {
        for (const log of fixtures.logs) {
          await safeCreate(() => this.prisma.log.create({ data: log }));
        }
      }
    } catch (error) {
      console.error("Failed to seed test data:", error);
      throw error;
    }
  }

  async cleanupTestData(): Promise<void> {
    try {
      // Delete in reverse order to respect foreign key constraints
      // Use try-catch for each table in case it doesn't exist
      const cleanupOperations = [
        () => this.prisma.log.deleteMany(),
        () => this.prisma.raise.deleteMany(),
        () => this.prisma.orderItem.deleteMany(),
        () => this.prisma.order.deleteMany(),
        () => this.prisma.productOnCategory.deleteMany(),
        () => this.prisma.product.deleteMany(),
        () => this.prisma.category.deleteMany(),
        () => this.prisma.user.deleteMany(),
        () => this.prisma.customRole.deleteMany(),
        () => this.prisma.settings.deleteMany(),
      ];

      for (const operation of cleanupOperations) {
        try {
          await operation();
        } catch (error: any) {
          // Ignore table not found errors (P2021)
          if (error.code !== "P2021") {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Failed to cleanup test data:", error);
      throw error;
    }
  }

  async createTestTransaction(): Promise<any> {
    // Prisma doesn't expose transactions directly for rollback in tests
    // Instead, we'll use the $transaction method for atomic operations
    return this.prisma;
  }

  async rollbackTransaction(transaction: any): Promise<void> {
    // For SQLite, we'll implement rollback by cleaning up data
    // This is a limitation of SQLite in test environments
    await this.cleanupTestData();
  }

  getTestPrismaClient(): PrismaClient {
    return this.prisma;
  }

  async closeConnection(): Promise<void> {
    try {
      await this.prisma.$disconnect();

      // Clean up test database file
      if (existsSync(this.testDbPath)) {
        unlinkSync(this.testDbPath);
      }
    } catch (error) {
      console.error("Failed to close database connection:", error);
    }
  }
}

// Singleton instance for test suite
let testDbHelper: DatabaseTestHelperImpl | null = null;

export function getTestDatabaseHelper(): DatabaseTestHelper {
  if (!testDbHelper) {
    testDbHelper = new DatabaseTestHelperImpl();
  }
  return testDbHelper;
}

export async function setupTestDatabase(): Promise<DatabaseTestHelper> {
  const helper = getTestDatabaseHelper();
  await helper.resetDatabase();
  return helper;
}

export async function teardownTestDatabase(): Promise<void> {
  if (testDbHelper) {
    await testDbHelper.closeConnection();
    testDbHelper = null;
  }
}
