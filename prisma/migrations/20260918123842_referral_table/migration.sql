/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referralEarnings" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "referredById" TEXT;

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.02,
    "sourceType" TEXT NOT NULL DEFAULT 'WALLET_FUNDING',
    "sourceAmount" DECIMAL(14,2) NOT NULL,
    "sourceReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREDITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReferralReward_referrerId_idx" ON "ReferralReward"("referrerId");

-- CreateIndex
CREATE INDEX "ReferralReward_refereeId_idx" ON "ReferralReward"("refereeId");

-- CreateIndex
CREATE INDEX "ReferralReward_sourceReference_idx" ON "ReferralReward"("sourceReference");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_referredById_idx" ON "User"("referredById");

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
