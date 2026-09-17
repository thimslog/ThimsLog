import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "../../../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";
import { getPayment } from "@/services/paymonetra";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: `Transaction is already marked as ${transaction.status}`,
          transaction,
        },
        { status: 400 }
      );
    }

    const referenceToQuery =
      transaction.paymonetraReference || transaction.merchantReference;

    if (!referenceToQuery) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction has no valid reference to query with provider",
        },
        { status: 400 }
      );
    }

    // Query Paymonetra
    const remoteResponse = await getPayment(referenceToQuery);

    // Paymonetra status normalization (prioritizing transaction data object over API wrapper)
    const remoteStatusRaw =
      remoteResponse?.data?.status ||
      remoteResponse?.data?.payment_status ||
      remoteResponse?.payment_status ||
      (typeof remoteResponse?.status === "string" && remoteResponse?.status !== "success"
        ? remoteResponse?.status
        : "") ||
      "";
    const status = String(remoteStatusRaw).toUpperCase().trim();

    const isSuccess = status === "SUCCESS" || status === "PAID" || status === "COMPLETED";
    const isExpired = status === "EXPIRED";
    const isFailed = status === "FAILED" || status === "CANCELLED" || status === "REJECTED";
    const isUnderpaid = status === "UNDERPAID";
    const isOverpaid = status === "OVERPAID";

    if (!isSuccess && !isExpired && !isFailed && !isUnderpaid && !isOverpaid) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: `Transaction is still pending on gateway (Status: ${status || "PENDING"})`,
        transaction,
        remoteResponse,
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

    const settledAmount = remoteResponse.amount || remoteResponse.data?.amount
      ? new Prisma.Decimal(remoteResponse.amount || remoteResponse.data?.amount)
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
          metadata: remoteResponse,
        },
        include: {
          wallet: {
            include: {
              user: true,
            },
          },
        },
      });

      // If resolved as success/overpaid/underpaid and was funding, credit wallet
      if ((finalStatus === "SUCCESS" || finalStatus === "OVERPAID" || finalStatus === "UNDERPAID") && transaction.type === "FUNDING") {
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: creditAmount } },
        });
      }

      // Log admin audit
      await tx.adminAuditLog.create({
        data: {
          adminId: admin.adminId,
          adminEmail: admin.email,
          action: "QUERY_TRANSACTION",
          entityType: "TRANSACTION",
          entityId: transaction.id,
          entityLabel: transaction.merchantReference,
          description: `Admin queried transaction ${transaction.merchantReference}. Resolved status: ${finalStatus}`,
          metadata: {
            previousStatus: transaction.status,
            newStatus: finalStatus,
            settledAmount: settledAmount.toString(),
            remoteResponse,
          },
        },
      });

      return result;
    });

    return NextResponse.json({
      success: true,
      updated: true,
      message: `Transaction successfully updated to ${finalStatus}`,
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Admin verify transaction error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to query transaction status from provider",
      },
      { status: 500 }
    );
  }
}
