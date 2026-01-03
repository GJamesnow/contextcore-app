-- CreateTable
CREATE TABLE "AssetAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "renovationBudget" REAL NOT NULL,
    "grossRent" REAL NOT NULL,
    "operatingExpenses" REAL NOT NULL,
    "capRate" REAL NOT NULL,
    "cashOnCash" REAL NOT NULL,
    "contextScore" INTEGER NOT NULL
);
