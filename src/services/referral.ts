import { prisma } from "@/lib/prisma";

export const DEFAULT_COMMISSION_RATE = 0.01; // 1% commission
export const MIN_COMMISSION_PURCHASE_THRESHOLD = 20000; // Minimum purchase amount required to trigger commission (₦20,000)

let schemaEnsured = false;

/**
 * Ensures required referral columns and tables exist in PostgreSQL database.
 */
export async function ensureReferralSchema() {
  if (schemaEnsured) return;
  try {
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredById" TEXT;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralEarnings" DECIMAL(14, 2) DEFAULT 0;
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ReferralReward" (
        "id" TEXT PRIMARY KEY,
        "referrerId" TEXT NOT NULL,
        "refereeId" TEXT NOT NULL,
        "amount" DECIMAL(14, 2) NOT NULL,
        "commissionRate" DECIMAL(5, 4) DEFAULT 0.01,
        "sourceType" TEXT DEFAULT 'ORDER_PURCHASE',
        "sourceAmount" DECIMAL(14, 2) NOT NULL,
        "sourceReference" TEXT,
        "status" TEXT DEFAULT 'CREDITED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    schemaEnsured = true;
  } catch (err) {
    console.warn("ensureReferralSchema warning:", err);
  }
}

export interface AwardCommissionParams {
  refereeUserId: string;
  sourceAmount: number;
  sourceType?: "ORDER_PURCHASE";
  sourceReference?: string;
}

/**
 * Automatically calculates and credits referral commissions to the referrer when a referee buys products >= ₦20,000.
 */
export async function processReferralCommission({
  refereeUserId,
  sourceAmount,
  sourceType = "ORDER_PURCHASE",
  sourceReference,
}: AwardCommissionParams) {
  try {
    await ensureReferralSchema();
    const gross = Number(sourceAmount) || 0;
    // Commission only triggers on purchases >= ₦20,000
    if (gross < MIN_COMMISSION_PURCHASE_THRESHOLD) {
      return null;
    }

    // 1. Fetch referee with referredById safely
    let referee: {
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
      referredById: string | null;
    } | null = null;

    try {
      const rows = await prisma.$queryRaw<Array<{
        id: string;
        firstName: string;
        lastName: string;
        userName: string;
        referredById: string | null;
      }>>`
        SELECT id, "firstName", "lastName", "userName", "referredById"
        FROM "User"
        WHERE id = ${refereeUserId}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        referee = rows[0];
      }
    } catch {
      return null;
    }

    if (!referee || !referee.referredById) {
      return null;
    }

    const referrerId = referee.referredById;

    // Don't award commission if user referred themselves (edge case)
    if (referrerId === refereeUserId) {
      return null;
    }

    // 2. Fetch referrer's wallet
    let referrerWallet = await prisma.wallet.findUnique({
      where: { userId: referrerId },
    });

    if (!referrerWallet) {
      referrerWallet = await prisma.wallet.create({
        data: { userId: referrerId, balance: 0 },
      });
    }

    // 3. Calculate 1% commission
    const commissionRate = DEFAULT_COMMISSION_RATE;
    const rawCommission = gross * commissionRate;
    const commission = Math.round(rawCommission * 100) / 100; // 2 decimals

    if (commission <= 0) return null;

    // 4. Atomic transaction to credit referrer and log records
    await prisma.$transaction(async (tx) => {
      // Credit wallet
      await tx.wallet.update({
        where: { id: referrerWallet.id },
        data: { balance: { increment: commission } },
      });

      // Increment lifetime referral earnings on referrer
      try {
        await (tx.user as any).update({
          where: { id: referrerId },
          data: { referralEarnings: { increment: commission } },
        });
      } catch (err) {
        console.warn("Could not update user referralEarnings:", err);
      }

      // Create ReferralReward log
      try {
        if ((tx as any).referralReward) {
          await (tx as any).referralReward.create({
            data: {
              referrerId,
              refereeId: referee.id,
              amount: commission,
              commissionRate,
              sourceType,
              sourceAmount: gross,
              sourceReference: sourceReference || null,
              status: "CREDITED",
            },
          });
        }
      } catch (rewardErr) {
        console.warn("Could not create ReferralReward record:", rewardErr);
      }

      // Log wallet transaction for referrer
      await tx.transaction.create({
        data: {
          walletId: referrerWallet.id,
          type: "FUNDING",
          status: "SUCCESS",
          amountRequested: commission,
          amount: commission,
          merchantReference: `ref_${Date.now()}_${referee.id.slice(0, 6)}`,
          provider: "REFERRAL_COMMISSION",
          metadata: {
            isReferralCommission: true,
            refereeId: referee.id,
            refereeName: `${referee.firstName} ${referee.lastName}`.trim() || referee.userName,
            sourceType,
            sourceAmount: gross,
            commissionRate: `${commissionRate * 100}%`,
          },
        },
      });

      // Send in-app notification to referrer
      try {
        if ((tx as any).notification) {
          await (tx as any).notification.create({
            data: {
              userId: referrerId,
              title: "💰 Referral Commission Earned!",
              message: `You just earned ₦${commission.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })} (1% commission) from ${referee.firstName}'s order purchase!`,
              type: "REFERRAL",
            },
          });
        }
      } catch (notifErr) {
        console.warn("Could not send referral notification:", notifErr);
      }
    });

    console.log(
      `[Referral System] Successfully credited ₦${commission} commission to referrer ${referrerId} from referee ${refereeUserId}`
    );

    return {
      success: true,
      referrerId,
      commission,
    };
  } catch (error) {
    console.error("[Referral System] Error processing referral commission:", error);
    return null;
  }
}
