import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma, Prisma } from "@/lib/prisma";
import {
  queryAnyPaymonetraReference,
  calculateVirtualAccountDeposit,
} from "@/services/paymonetra";

/**
 * Admin API to verify, calculate exact fees, and import any missing Paymonetra transaction directly.
 * Automatically verifies with Paymonetra API, applies the standard Paymonetra 1% fee formula
 * (e.g. ₦2,200 gross -> ₦22 fee -> ₦2,178 credited to user), and records the transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { reference, accountNumber, userId, amount: manualAmount } = body;

    if (!reference && !accountNumber && !userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide at least a transaction reference, virtual account number, or userId.",
        },
        { status: 400 }
      );
    }

    // 1. Check if this reference is ALREADY in our DB with status SUCCESS
    if (reference) {
      const cleanRef = reference.trim();
      const existing = await prisma.transaction.findFirst({
        where: {
          status: "SUCCESS",
          OR: [
            { collectionReference: cleanRef },
            { paymonetraReference: cleanRef },
            { merchantReference: cleanRef },
            { merchantReference: `va_${cleanRef}` },
          ],
        },
        include: { wallet: { include: { user: true } } },
      });

      if (existing) {
        return NextResponse.json({
          success: false,
          alreadyProcessed: true,
          message: `Transaction ${cleanRef} was already credited previously with ₦${Number(existing.amountRequested || existing.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}. No duplicate credit applied.`,
          transaction: existing,
        });
      }
    }

    // 2. Query Paymonetra API directly
    let gatewayResult: any = null;
    if (reference) {
      try {
        gatewayResult = await queryAnyPaymonetraReference(reference);
      } catch (err: any) {
        console.warn(
          `Paymonetra API query for '${reference}' failed:`,
          err?.message
        );
      }
    }

    const payload = gatewayResult?.data || {};

    // Check status if returned by Paymonetra
    const remoteRawStatus =
      payload.status ||
      payload.payment_status ||
      (typeof payload === "string" ? payload : "");
    const statusStr = String(remoteRawStatus).toUpperCase().trim();

    if (
      statusStr &&
      statusStr !== "SUCCESS" &&
      statusStr !== "PAID" &&
      statusStr !== "COMPLETED" &&
      statusStr !== "COLLECTION.SUCCESS"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Gateway reported transaction status is '${statusStr}', not completed.`,
          gatewayData: payload,
        },
        { status: 400 }
      );
    }

    // Resolve Account & Customer
    const resolvedAccount =
      accountNumber ||
      payload.account_number ||
      payload.accountNumber ||
      payload.virtual_account_number;

    const resolvedCustomerRef =
      payload.customer_reference ||
      payload.customerReference ||
      payload.customer_id;

    // Resolve Amounts & Fee calculation (e.g. ₦2,200 gross -> ₦22 fee -> ₦2,178 net credit)
    const rawGrossAmount = Number(payload.amount || manualAmount) || 0;
    const { grossAmount, fee, netAmount } = calculateVirtualAccountDeposit(
      rawGrossAmount,
      payload.fee !== undefined ? Number(payload.fee) : null,
      payload.net !== undefined ? Number(payload.net) : null
    );

    if (grossAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not determine transaction amount from Paymonetra API or manual input.",
        },
        { status: 400 }
      );
    }

    // 3. Locate user's wallet
    const walletFilters: Prisma.WalletWhereInput[] = [];
    if (userId) walletFilters.push({ userId });
    if (resolvedCustomerRef) {
      walletFilters.push({ paymonetraCustomer: resolvedCustomerRef });
      walletFilters.push({ virtualAccountReference: resolvedCustomerRef });
      if (
        typeof resolvedCustomerRef === "string" &&
        resolvedCustomerRef.startsWith("wallet_")
      ) {
        walletFilters.push({
          userId: resolvedCustomerRef.replace("wallet_", ""),
        });
      }
    }
    if (resolvedAccount) {
      walletFilters.push({ accountNumber: String(resolvedAccount) });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { OR: walletFilters },
      include: { user: true },
    });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: `No matching user wallet found for Account: ${resolvedAccount || "N/A"}, Customer: ${resolvedCustomerRef || "N/A"}, User: ${userId || "N/A"}`,
        },
        { status: 404 }
      );
    }

    const txnRef = reference?.trim() || `manual_sync_${Date.now()}`;

    // 4. Atomically record transaction and credit wallet
    const result = await prisma.$transaction(async (tx) => {
      // Re-check for any already-successful transaction under this reference to guarantee idempotency
      const existingSuccess = await tx.transaction.findFirst({
        where: {
          status: "SUCCESS",
          OR: [
            { collectionReference: txnRef },
            { paymonetraReference: txnRef },
            { merchantReference: txnRef },
            { merchantReference: `va_${txnRef}` },
          ],
        },
      });

      if (existingSuccess) {
        throw new Error("ALREADY_CREDITED");
      }

      // Check existing pending transaction to update if available
      const existingPending = await tx.transaction.findFirst({
        where: {
          walletId: wallet.id,
          status: "PENDING",
          OR: [
            { merchantReference: txnRef },
            { paymonetraReference: txnRef },
            { collectionReference: txnRef },
          ],
        },
      });

      let savedTx;
      if (existingPending) {
        savedTx = await tx.transaction.update({
          where: { id: existingPending.id },
          data: {
            status: "SUCCESS",
            amountRequested: netAmount,
            amount: grossAmount,
            collectionReference: txnRef,
            paymonetraReference: txnRef,
            metadata: {
              ...(typeof existingPending.metadata === "object"
                ? existingPending.metadata
                : {}),
              gatewayResult,
              grossAmount,
              fee,
              netAmount,
              syncedByAdmin: admin.email,
              syncedAt: new Date().toISOString(),
            },
          },
        });
      } else {
        savedTx = await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "FUNDING",
            status: "SUCCESS",
            amountRequested: netAmount,
            amount: grossAmount,
            merchantReference: `va_${txnRef}`,
            paymonetraReference: txnRef,
            collectionReference: txnRef,
            provider: "paymontera",
            metadata: {
              gatewayResult,
              channel: "admin_manual_sync",
              grossAmount,
              fee,
              netAmount,
              syncedByAdmin: admin.email,
              syncedAt: new Date().toISOString(),
            },
          },
        });
      }

      // Credit wallet with exact NET amount after gateway fee
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: netAmount } },
      });

      // Log admin audit
      await tx.adminAuditLog.create({
        data: {
          adminId: admin.adminId,
          adminEmail: admin.email,
          action: "SYNC_TRANSACTION",
          entityType: "TRANSACTION",
          entityId: savedTx.id,
          entityLabel: savedTx.merchantReference,
          description: `Admin synced Paymonetra transfer ${txnRef}: Gross ₦${grossAmount}, Fee ₦${fee}, Credited ₦${netAmount} to user ${wallet.user?.email || wallet.userId}.`,
          metadata: {
            reference: txnRef,
            grossAmount,
            fee,
            netAmount,
            walletId: wallet.id,
            newBalance: updatedWallet.balance.toString(),
          },
        },
      });

      return { savedTx, updatedWallet };
    });

    // Send in-app notification
    if (wallet.userId) {
      try {
        await (prisma as any).notification.create({
          data: {
            userId: wallet.userId,
            title: "Wallet Deposit Confirmed",
            message: `Your deposit of ₦${grossAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} (Net: ₦${netAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}, Fee: ₦${fee.toLocaleString("en-NG", { minimumFractionDigits: 2 })}) has been confirmed and credited.`,
            type: "WALLET_FUNDED",
            metadata: {
              transactionId: result.savedTx.id,
              reference: txnRef,
              grossAmount,
              fee,
              amount: netAmount,
            },
          },
        });
      } catch (notifErr) {
        console.warn("Could not dispatch notification:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully verified with Paymonetra and credited ₦${netAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} (Gross: ₦${grossAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}, Fee: ₦${fee.toLocaleString("en-NG", { minimumFractionDigits: 2 })}) to ${wallet.user?.email || "user"}!`,
      data: {
        transaction: result.savedTx,
        grossAmount,
        fee,
        netAmount,
        newBalance: result.updatedWallet.balance,
      },
    });
  } catch (error: any) {
    if (error?.message === "ALREADY_CREDITED") {
      return NextResponse.json({
        success: false,
        alreadyProcessed: true,
        message:
          "This transaction has already been credited previously. No duplicate credit was applied.",
      });
    }

    console.error("Admin sync transaction error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to sync transaction",
      },
      { status: 500 }
    );
  }
}
