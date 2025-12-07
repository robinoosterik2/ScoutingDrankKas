-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" DATETIME NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Product" ("ageRestriction", "createdAt", "description", "id", "imageUrl", "name", "packSize", "popularityScore", "price", "recentOrders", "stock", "totalOrders", "totalQuantitySold", "updatedAt") SELECT "ageRestriction", "createdAt", "description", "id", "imageUrl", "name", "packSize", "popularityScore", "price", "recentOrders", "stock", "totalOrders", "totalQuantitySold", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
