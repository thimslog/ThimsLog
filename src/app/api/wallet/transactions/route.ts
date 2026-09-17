import { NextResponse } from "next/server";
import { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET() {
  const userData = await getCurrentUser();
  const userId = userData?.id;
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized Access" },
      { status: 401 },
    );
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return NextResponse.json({ transactions: [] });
  }

  // Oldest-first so we can walk a running balance, then reverse for display.
  const transactions = await prisma.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "asc" },
  });

  let runningBalance = new Prisma.Decimal(0);
  const withBalances = transactions.map((tx) => {
    const balanceBefore = runningBalance;
    const effectiveAmount = tx.amount ?? tx.amountRequested;

    // Credit for FUNDING and REFUND, Debit for PAYMENT
    if (tx.status === "SUCCESS" && effectiveAmount) {
      if (tx.type === "PAYMENT") {
        runningBalance = runningBalance.sub(effectiveAmount);
      } else {
        runningBalance = runningBalance.add(effectiveAmount);
      }
    }

    return {
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amount: effectiveAmount.toString(),
      merchantReference: tx.merchantReference,
      serviceId: tx.paymonetraReference ?? tx.collectionReference ?? null,
      provider: tx.provider,
      balanceBefore: balanceBefore.toString(),
      balanceAfter: runningBalance.toString(),
      createdAt: tx.createdAt,
    };
  });

  return NextResponse.json({
    success: true,
    message: "Transaction fetched successfully",
    transactions: withBalances.reverse(),
  });
}
