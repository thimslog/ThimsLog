import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { processReferralCommission } from "@/services/referral";
import { emitWalletBalanceUpdated } from "@/lib/socket-server";

export async function POST(req: NextRequest) {
  try {
    const userData = await getCurrentUser();
    const userId = userData?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    const { accountTypeId, accountIds } = await req.json();

    if (!accountTypeId || !Array.isArray(accountIds) || accountIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid purchase request. Please select at least one account." },
        { status: 400 }
      );
    }

    // Deduplicate IDs in case client sent duplicate IDs
    const uniqueAccountIds = Array.from(new Set(accountIds.map((id: any) => String(id))));

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Lock the wallet row to prevent race conditions / double-spending
        const wallets = await tx.$queryRaw<Array<{ id: string; balance: string }>>`
          SELECT id, balance FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE;
        `;

        if (!wallets || wallets.length === 0) {
          throw new Error("WALLET_NOT_FOUND");
        }

        const wallet = wallets[0];
        const currentBalance = Number(wallet.balance);

        // 2. Fetch AccountType to get authoritative unit price
        const accountType = await tx.accountType.findUnique({
          where: { id: accountTypeId },
        });

        if (!accountType) {
          throw new Error("ACCOUNT_TYPE_NOT_FOUND");
        }

        const unitPrice = Number(accountType.price);
        const totalCost = unitPrice * uniqueAccountIds.length;

        // 3. Check sufficient balance
        if (currentBalance < totalCost) {
          const diff = totalCost - currentBalance;
          throw new Error(
            `INSUFFICIENT_FUNDS: Current balance ₦${currentBalance.toLocaleString()}, required ₦${totalCost.toLocaleString()} (short by ₦${diff.toLocaleString()})`
          );
        }

        // 4. Lock and verify all selected inventory accounts are AVAILABLE
        const availableAccounts = await tx.$queryRaw<Array<{ id: string; status: string }>>`
          SELECT id, status FROM "InventoryAccount" 
          WHERE id = ANY(${uniqueAccountIds}::text[]) AND status = 'AVAILABLE' 
          FOR UPDATE;
        `;

        if (availableAccounts.length !== uniqueAccountIds.length) {
          throw new Error("ACCOUNTS_UNAVAILABLE");
        }

        // 5. Deduct from wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              decrement: totalCost,
            },
          },
        });

        // 6. Create Order record
        const order = await tx.order.create({
          data: {
            userId,
            accountTypeId,
            quantity: uniqueAccountIds.length,
            unitPrice,
            totalAmount: totalCost,
            status: "COMPLETED",
          },
        });

        // 7. Update Inventory Accounts to SOLD and associate with Order
        await tx.inventoryAccount.updateMany({
          where: {
            id: { in: uniqueAccountIds },
          },
          data: {
            status: "SOLD",
            orderId: order.id,
          },
        });

        // 8. Record Transaction ledger entry
        const merchantReference = `ord_${order.id.slice(0, 8)}_${Date.now()}`;
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "PAYMENT",
            status: "SUCCESS",
            amountRequested: totalCost,
            amount: totalCost,
            merchantReference,
            metadata: {
              orderId: order.id,
              accountTypeId,
              accountTypeName: accountType.name,
              quantity: uniqueAccountIds.length,
              accountIds: uniqueAccountIds,
              unitPrice,
              totalCost,
            },
          },
        });

        return {
          orderId: order.id,
          totalCost,
          remainingBalance: Number(updatedWallet.balance),
          quantity: uniqueAccountIds.length,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    // Broadcast live wallet balance update via Socket.IO
    emitWalletBalanceUpdated({
      userId,
      balance: Number(result.remainingBalance),
      delta: -Number(result.totalCost),
      reason: `Purchased ${result.quantity} account(s)`,
    });

    // Trigger referral commission for purchases >= ₦20,000 (non-blocking)
    if (result && result.totalCost >= 20000) {
      processReferralCommission({
        refereeUserId: userId,
        sourceAmount: result.totalCost,
        sourceType: "ORDER_PURCHASE",
        sourceReference: result.orderId,
      }).catch((refErr) => {
        console.error("Referral commission processing error:", refErr);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully! Accounts have been added to your order history.",
      data: result,
    });
  } catch (error: any) {
    console.error("Inventory checkout error:", error);

    const msg = error?.message || "";
    if (msg.startsWith("INSUFFICIENT_FUNDS")) {
      return NextResponse.json(
        {
          success: false,
          code: "INSUFFICIENT_FUNDS",
          message: msg.replace("INSUFFICIENT_FUNDS: ", "") || "Insufficient wallet balance to complete this purchase.",
        },
        { status: 400 }
      );
    }

    if (msg === "ACCOUNTS_UNAVAILABLE") {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNTS_UNAVAILABLE",
          message: "One or more of the selected accounts were just purchased by another user. Please refresh and select available accounts.",
        },
        { status: 409 }
      );
    }

    if (msg === "WALLET_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "Wallet not found for this user." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during checkout. Please try again.",
      },
      { status: 500 }
    );
  }
}
