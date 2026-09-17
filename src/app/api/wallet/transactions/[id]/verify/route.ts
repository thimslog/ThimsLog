import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "../../../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { getPayment } from "@/services/paymonetra";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const userData = await getCurrentUser();
  const userId = userData?.id;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized Access" }, { status: 401 });
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.walletId !== wallet.id) {
    return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
  }

  if (transaction.status !== "PENDING") {
    return NextResponse.json(
      { message: "Only pending transactions can be requeried" },
      { status: 400 }
    );
  }

  if (!transaction.paymonetraReference) {
    return NextResponse.json(
      { message: "Transaction has no Paymonetra reference to verify against" },
      { status: 400 }
    );
  }

  const remoteStatus = await getPayment(transaction.paymonetraReference);

  // TODO: confirm the real field names Paymonetra returns here (status / amount) —
  // this assumes `remoteStatus.status` is one of pending/success/failed and
  // `remoteStatus.amount` is the settled amount. Adjust once you have a sample response.
  const status = String(remoteStatus.status ?? "").toUpperCase();

  if (status !== "SUCCESS" && status !== "FAILED") {
    // Still pending on Paymonetra's side — nothing to update yet.
    return NextResponse.json({ transaction, updated: false });
  }

  const settledAmount = remoteStatus.amount
    ? new Prisma.Decimal(remoteStatus.amount)
    : transaction.amountRequested;

  const updatedTransaction = await prisma.$transaction(async (tx) => {
    const result = await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status,
        amount: settledAmount,
        metadata: remoteStatus,
      },
    });

    // Only a confirmed success actually moves money.
    if (status === "SUCCESS") {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: settledAmount } },
      });
    }

    return result;
  });

  return NextResponse.json({ transaction: updatedTransaction, updated: true });
}