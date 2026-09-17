import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
            paymonetraCustomer: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            virtualAccountReference: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let transactions: any[] = [];
    if (user.wallet?.id) {
      transactions = await prisma.transaction.findMany({
        where: { walletId: user.wallet.id },
        orderBy: { createdAt: "desc" },
      });
    }

    // Compute stats
    let totalFunded = 0;
    let totalSpent = 0;
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amountRequested || tx.amount || 0);
      if (tx.status === "SUCCESS") {
        successCount++;
        if (tx.type === "FUNDING") {
          totalFunded += amt;
        } else if (tx.type === "PAYMENT") {
          totalSpent += amt;
        }
      } else if (tx.status === "PENDING") {
        pendingCount++;
      } else {
        failedCount++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        wallet: user.wallet
          ? {
              id: user.wallet.id,
              balance: Number(user.wallet.balance),
              currency: user.wallet.currency,
              paymonetraCustomer: user.wallet.paymonetraCustomer,
              bankName: user.wallet.bankName,
              accountNumber: user.wallet.accountNumber,
              accountName: user.wallet.accountName,
              virtualAccountReference: user.wallet.virtualAccountReference,
              createdAt: user.wallet.createdAt,
              updatedAt: user.wallet.updatedAt,
            }
          : null,
        transactions,
        stats: {
          totalTransactions: transactions.length,
          totalFunded,
          totalSpent,
          successCount,
          pendingCount,
          failedCount,
        },
      },
    });
  } catch (error: any) {
    console.error("GET single user error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
