import { Prisma } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/services/paymonetra";

export interface ReconcileOptions {
  walletId?: string;
  userId?: string;
  limit?: number;
  maxAgeHours?: number;
}

export interface ReconcileResult {
  checkedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorsCount: number;
  details: Array<{
    id: string;
    reference: string;
    oldStatus: string;
    newStatus: string;
    amount?: number | string;
    reason?: string;
  }>;
}

/**
 * Reconciles pending transactions against the payment gateway.
 * Can be run for a single user/wallet or globally via Cron / Webhook.
 */
export async function reconcilePendingTransactions(
  options: ReconcileOptions = {}
): Promise<ReconcileResult> {
  const { walletId, userId, limit = 50, maxAgeHours = 72 } = options;

  let targetWalletId = walletId;
  if (!targetWalletId && userId) {
    const userWallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });
    targetWalletId = userWallet?.id;
  }

  const cutoffDate = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

  // 1. Fetch pending transactions
  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
      ...(targetWalletId ? { walletId: targetWalletId } : {}),
      createdAt: { gte: cutoffDate },
      provider: { not: "thimslog_internal" },
    },
    include: {
      wallet: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const result: ReconcileResult = {
    checkedCount: pendingTransactions.length,
    updatedCount: 0,
    skippedCount: 0,
    errorsCount: 0,
    details: [],
  };

  const now = Date.now();

  for (const tx of pendingTransactions) {
    const reference = tx.paymonetraReference || tx.merchantReference;
    const ageInMinutes = (now - new Date(tx.createdAt).getTime()) / (1000 * 60);

    if (!reference) {
      result.skippedCount++;
      continue;
    }

    try {
      let remoteStatus: any = null;
      try {
        remoteStatus = await getPayment(reference);
      } catch (gatewayErr: any) {
        // If the transaction has been pending for over 24 hours and gateway cannot find it or returns error, auto-expire
        if (ageInMinutes > 24 * 60) {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: {
              status: "EXPIRED" as any,
              metadata: {
                autoExpired: true,
                reason: "Pending threshold exceeded 24 hours without gateway settlement.",
              },
            },
          });

          result.updatedCount++;
          result.details.push({
            id: tx.id,
            reference,
            oldStatus: "PENDING",
            newStatus: "EXPIRED",
            reason: "Auto-expired after 24 hours",
          });
          continue;
        }

        result.skippedCount++;
        continue;
      }

      const rawStatus =
        remoteStatus?.data?.status ||
        remoteStatus?.data?.payment_status ||
        remoteStatus?.payment_status ||
        (typeof remoteStatus?.status === "string" && remoteStatus?.status !== "success"
          ? remoteStatus?.status
          : "") ||
        "";
      const status = String(rawStatus).toUpperCase().trim();

      const isSuccess =
        status === "SUCCESS" || status === "PAID" || status === "COMPLETED";
      const isExpired = status === "EXPIRED";
      const isFailed =
        status === "FAILED" || status === "CANCELLED" || status === "REJECTED";
      const isUnderpaid = status === "UNDERPAID";
      const isOverpaid = status === "OVERPAID";

      // If still pending on gateway side
      if (!isSuccess && !isExpired && !isFailed && !isUnderpaid && !isOverpaid) {
        // If pending for > 24 hours, auto-expire
        if (ageInMinutes > 24 * 60) {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: {
              status: "EXPIRED" as any,
              metadata: {
                autoExpired: true,
                gatewayStatus: status || "PENDING",
              },
            },
          });

          result.updatedCount++;
          result.details.push({
            id: tx.id,
            reference,
            oldStatus: "PENDING",
            newStatus: "EXPIRED",
            reason: "Auto-expired after 24h of pending state",
          });
        } else {
          result.skippedCount++;
        }
        continue;
      }

      const finalStatus: "SUCCESS" | "EXPIRED" | "FAILED" | "UNDERPAID" | "OVERPAID" =
        isSuccess
          ? "SUCCESS"
          : isExpired
          ? "EXPIRED"
          : isUnderpaid
          ? "UNDERPAID"
          : isOverpaid
          ? "OVERPAID"
          : "FAILED";

      const settledAmount =
        remoteStatus.amount || remoteStatus.data?.amount
          ? new Prisma.Decimal(remoteStatus.amount || remoteStatus.data?.amount)
          : tx.amountRequested;

      const creditAmount =
        finalStatus === "UNDERPAID"
          ? settledAmount
          : tx.amountRequested || settledAmount;

      // Atomically update transaction and increment wallet balance
      await prisma.$transaction(async (prismaTx) => {
        // Double-check current status to prevent race conditions & double credits
        const freshTx = await prismaTx.transaction.findUnique({
          where: { id: tx.id },
          select: { status: true },
        });

        if (freshTx?.status !== "PENDING") {
          return; // Already resolved
        }

        await prismaTx.transaction.update({
          where: { id: tx.id },
          data: {
            status: finalStatus as any,
            amount: settledAmount,
            metadata: remoteStatus,
          },
        });

        if (
          (finalStatus === "SUCCESS" ||
            finalStatus === "OVERPAID" ||
            finalStatus === "UNDERPAID") &&
          tx.type === "FUNDING"
        ) {
          await prismaTx.wallet.update({
            where: { id: tx.walletId },
            data: { balance: { increment: creditAmount } },
          });
        }
      });

      // Send in-app notification if transaction was funded
      if (
        (finalStatus === "SUCCESS" ||
          finalStatus === "OVERPAID" ||
          finalStatus === "UNDERPAID") &&
        tx.type === "FUNDING" &&
        tx.wallet?.userId
      ) {
        try {
          await (prisma as any).notification.create({
            data: {
              userId: tx.wallet.userId,
              title: "Wallet Funded Successfully",
              message: `Your wallet funding of ₦${Number(creditAmount).toLocaleString("en-NG", { minimumFractionDigits: 2 })} has been confirmed and credited.`,
              type: "WALLET_FUNDED",
              metadata: {
                transactionId: tx.id,
                reference,
                amount: Number(creditAmount),
              },
            },
          });
        } catch (notifErr) {
          console.warn("Could not dispatch funding notification:", notifErr);
        }
      }

      result.updatedCount++;
      result.details.push({
        id: tx.id,
        reference,
        oldStatus: "PENDING",
        newStatus: finalStatus,
        amount: Number(creditAmount),
      });
    } catch (err: any) {
      console.error(`Error reconciling transaction ${tx.id}:`, err?.message || err);
      result.errorsCount++;
    }
  }

  return result;
}
