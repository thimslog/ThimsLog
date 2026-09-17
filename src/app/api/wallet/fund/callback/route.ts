import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "../../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/services/paymonetra";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;
  const reference =
    searchParams.get("reference") ||
    searchParams.get("ref") ||
    searchParams.get("trxref") ||
    searchParams.get("checkout_reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { merchantReference: reference },
          { paymonetraReference: reference },
        ],
      },
      include: { wallet: true },
    });

    if (!transaction) {
      return NextResponse.redirect(
        new URL("/dashboard?payment=unknown", origin)
      );
    }

    // If already processed as success
    if (transaction.status === "SUCCESS") {
      return NextResponse.redirect(
        new URL(
          `/dashboard?payment=success&amount=${transaction.amountRequested}`,
          origin
        )
      );
    }

    const refToQuery =
      transaction.paymonetraReference || transaction.merchantReference;

    if (!refToQuery) {
      return NextResponse.redirect(
        new URL("/dashboard?payment=pending", origin)
      );
    }

    const remoteStatus = await getPayment(refToQuery).catch(() => null);

    if (remoteStatus) {
      const statusRaw =
        remoteStatus?.data?.status ||
        remoteStatus?.data?.payment_status ||
        remoteStatus?.payment_status ||
        (typeof remoteStatus?.status === "string" && remoteStatus?.status !== "success"
          ? remoteStatus?.status
          : "") ||
        "";
      const status = String(statusRaw).toUpperCase().trim();

      if (status === "SUCCESS" || status === "PAID") {
        const settledAmount = remoteStatus.amount || remoteStatus.data?.amount
          ? new Prisma.Decimal(remoteStatus.amount || remoteStatus.data?.amount)
          : transaction.amountRequested;

        await prisma.$transaction(async (tx) => {
          // Double check transaction status inside transaction
          const currentTx = await tx.transaction.findUnique({
            where: { id: transaction.id },
          });

          if (currentTx && currentTx.status !== "SUCCESS") {
            await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                status: "SUCCESS",
                amount: settledAmount,
                metadata: remoteStatus,
              },
            });

            const creditAmount = transaction.amountRequested || settledAmount;

            await tx.wallet.update({
              where: { id: transaction.walletId },
              data: { balance: { increment: creditAmount } },
            });
          }
        });

        return NextResponse.redirect(
          new URL(
            `/dashboard?payment=success&amount=${settledAmount.toString()}`,
            origin
          )
        );
      } else if (status === "FAILED") {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "FAILED", metadata: remoteStatus },
        });

        return NextResponse.redirect(
          new URL("/dashboard?payment=failed", origin)
        );
      }
    }

    // Default to pending / processing
    return NextResponse.redirect(
      new URL("/dashboard?payment=processing", origin)
    );
  } catch (error) {
    console.error("Wallet fund callback error:", error);
    return NextResponse.redirect(new URL("/dashboard", origin));
  }
}
