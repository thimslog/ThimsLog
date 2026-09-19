import { NextResponse } from "next/server";
import { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { reconcilePendingTransactions } from "@/lib/reconcile-transactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const userData = await getCurrentUser();
  const userId = userData?.id;
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized Access" },
      { status: 401 }
    );
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return NextResponse.json(
      { transactions: [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }

  // 1. Fetch transactions
  let transactions = await prisma.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "asc" },
  });

  // 2. Opportunistic reconciliation for any pending transactions
  const hasPending = transactions.some((t) => t.status === "PENDING" && t.provider !== "thimslog_internal");
  if (hasPending) {
    try {
      const recResult = await reconcilePendingTransactions({ walletId: wallet.id, limit: 10 });
      if (recResult.updatedCount > 0) {
        // Re-fetch with latest statuses
        transactions = await prisma.transaction.findMany({
          where: { walletId: wallet.id },
          orderBy: { createdAt: "asc" },
        });
      }
    } catch (err) {
      console.warn("Opportunistic transaction reconciliation error:", err);
    }
  }

  let runningBalance = new Prisma.Decimal(0);
  const withBalances = transactions.map((tx) => {
    const balanceBefore = runningBalance;
    const effectiveAmount = tx.amount ?? tx.amountRequested;

    const meta = tx.metadata as any;
    const normalizedType =
      tx.type === "TRANSFER_SENT" || meta?.transferType === "TRANSFER_SENT"
        ? "TRANSFER_SENT"
        : tx.type === "TRANSFER_RECEIVED" || meta?.transferType === "TRANSFER_RECEIVED"
        ? "TRANSFER_RECEIVED"
        : tx.type;

    // Credit for FUNDING, REFUND, TRANSFER_RECEIVED; Debit for PAYMENT, TRANSFER_SENT
    if (tx.status === "SUCCESS" && effectiveAmount) {
      if (normalizedType === "PAYMENT" || normalizedType === "TRANSFER_SENT") {
        runningBalance = runningBalance.sub(effectiveAmount);
      } else {
        runningBalance = runningBalance.add(effectiveAmount);
      }
    }

    return {
      id: tx.id,
      type: normalizedType,
      status: tx.status,
      amount: effectiveAmount.toString(),
      merchantReference: tx.merchantReference,
      serviceId: tx.paymonetraReference ?? tx.collectionReference ?? null,
      provider: tx.provider,
      balanceBefore: balanceBefore.toString(),
      balanceAfter: runningBalance.toString(),
      metadata: tx.metadata,
      createdAt: tx.createdAt,
    };
  });

  return NextResponse.json(
    {
      success: true,
      message: "Transaction fetched successfully",
      transactions: withBalances.reverse(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
