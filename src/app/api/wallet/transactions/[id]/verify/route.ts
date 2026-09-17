import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "../../../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { getPayment } from "@/services/paymonetra";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const userData = await getCurrentUser();
    const userId = userData?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized Access" },
        { status: 401 }
      );
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return NextResponse.json(
        { success: false, message: "Wallet not found" },
        { status: 404 }
      );
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.walletId !== wallet.id) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json({
        success: true,
        updated: false,
        message: `Transaction is already marked as ${transaction.status}`,
        transaction,
      });
    }

    const referenceToQuery =
      transaction.paymonetraReference || transaction.merchantReference;

    if (!referenceToQuery) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction has no reference to verify against payment gateway",
        },
        { status: 400 }
      );
    }

    let remoteStatus: any = null;
    try {
      remoteStatus = await getPayment(referenceToQuery);
    } catch (err: any) {
      console.warn("Paymonetra query payment error:", err?.message || err);
      return NextResponse.json({
        success: true,
        updated: false,
        message: "Payment is still processing or not yet settled on the gateway.",
        transaction,
      });
    }

    const rawStatus =
      remoteStatus?.status ||
      remoteStatus?.data?.status ||
      remoteStatus?.payment_status ||
      "";
    const status = String(rawStatus).toUpperCase().trim();

    const isSuccess = status === "SUCCESS" || status === "PAID" || status === "COMPLETED";
    const isExpired = status === "EXPIRED";
    const isFailed = status === "FAILED" || status === "CANCELLED" || status === "REJECTED";
    const isUnderpaid = status === "UNDERPAID";
    const isOverpaid = status === "OVERPAID";

    if (!isSuccess && !isExpired && !isFailed && !isUnderpaid && !isOverpaid) {
      // Still pending on Paymonetra's side — nothing to update yet.
      return NextResponse.json({
        success: true,
        updated: false,
        message: "Payment is still pending on gateway. Please check back shortly.",
        transaction,
      });
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
        : transaction.amountRequested;

    const creditAmount =
      finalStatus === "UNDERPAID"
        ? settledAmount
        : transaction.amountRequested || settledAmount;

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: finalStatus as any,
          amount: settledAmount,
          metadata: remoteStatus,
        },
      });

      // Only confirmed payments move money
      if (
        (finalStatus === "SUCCESS" || finalStatus === "OVERPAID" || finalStatus === "UNDERPAID") &&
        transaction.type === "FUNDING"
      ) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: creditAmount } },
        });
      }

      return result;
    });

    let returnMessage = "Payment status updated.";
    if (finalStatus === "SUCCESS" || finalStatus === "OVERPAID") {
      returnMessage = "Payment verified successfully! Your wallet has been credited.";
    } else if (finalStatus === "UNDERPAID") {
      returnMessage = `Partial payment received (${settledAmount}). Your wallet has been credited.`;
    } else if (finalStatus === "EXPIRED") {
      returnMessage = "Payment session expired on gateway.";
    } else {
      returnMessage = "Payment was marked as failed by gateway.";
    }

    return NextResponse.json({
      success: true,
      updated: true,
      message: returnMessage,
      transaction: updatedTransaction,
    });
  } catch (error: any) {
    console.error("Wallet verify route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Could not verify transaction at this time.",
      },
      { status: 500 }
    );
  }
}