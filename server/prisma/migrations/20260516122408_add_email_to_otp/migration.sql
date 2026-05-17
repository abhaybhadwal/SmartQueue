/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WaitTimeMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "averageServiceTime" REAL NOT NULL,
    "totalTokensServed" INTEGER NOT NULL,
    "lastUpdatedAt" DATETIME NOT NULL,
    CONSTRAINT "WaitTimeMetric_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WaitTimeMetric" ("averageServiceTime", "id", "lastUpdatedAt", "serviceId", "totalTokensServed") SELECT "averageServiceTime", "id", "lastUpdatedAt", "serviceId", "totalTokensServed" FROM "WaitTimeMetric";
DROP TABLE "WaitTimeMetric";
ALTER TABLE "new_WaitTimeMetric" RENAME TO "WaitTimeMetric";
CREATE UNIQUE INDEX "WaitTimeMetric_serviceId_key" ON "WaitTimeMetric"("serviceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
