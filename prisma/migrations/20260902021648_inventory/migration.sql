-- CreateEnum
CREATE TYPE "InventoryCategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InventoryAccountStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'SOLD', 'SUSPENDED', 'DISABLED');

-- CreateTable
CREATE TABLE "AccountType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAccount" (
    "id" TEXT NOT NULL,
    "accountTypeId" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "url" TEXT,
    "status" "InventoryAccountStatus" NOT NULL DEFAULT 'AVAILABLE',
    "country" TEXT,
    "followers" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "InventoryCategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountType_categoryId_idx" ON "AccountType"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountType_categoryId_name_key" ON "AccountType"("categoryId", "name");

-- CreateIndex
CREATE INDEX "InventoryAccount_accountTypeId_idx" ON "InventoryAccount"("accountTypeId");

-- CreateIndex
CREATE INDEX "InventoryAccount_status_idx" ON "InventoryAccount"("status");

-- CreateIndex
CREATE INDEX "InventoryAccount_country_idx" ON "InventoryAccount"("country");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCategory_name_key" ON "InventoryCategory"("name");

-- CreateIndex
CREATE INDEX "InventoryCategory_status_idx" ON "InventoryCategory"("status");

-- AddForeignKey
ALTER TABLE "AccountType" ADD CONSTRAINT "AccountType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAccount" ADD CONSTRAINT "InventoryAccount_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "AccountType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
