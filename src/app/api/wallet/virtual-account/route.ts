import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import { createVirtualAccount } from "@/services/paymonetra";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const userData = await getCurrentUser();
    const userId = userData?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized Access" },
        { status: 401 }
      );
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          paymonetraCustomer: `wallet_${userId}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        wallet: {
          id: wallet.id,
          balance: Number(wallet.balance),
          currency: wallet.currency,
          bankName: wallet.bankName,
          accountNumber: wallet.accountNumber,
          accountName: wallet.accountName,
          virtualAccountReference: wallet.virtualAccountReference,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET virtual-account error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await getCurrentUser();
    const userId = userData?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized Access" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          paymonetraCustomer: `wallet_${userId}`,
        },
      });
    }

    // If already generated, return existing
    if (wallet.accountNumber) {
      return NextResponse.json({
        success: true,
        message: "Virtual account already active",
        wallet: {
          id: wallet.id,
          balance: Number(wallet.balance),
          currency: wallet.currency,
          bankName: wallet.bankName,
          accountNumber: wallet.accountNumber,
          accountName: wallet.accountName,
          virtualAccountReference: wallet.virtualAccountReference,
        },
      });
    }

    const customerReference = wallet.paymonetraCustomer || `wallet_${userId}`;
    const customerName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.userName ||
      user.email ||
      "Customer";

    const response = await createVirtualAccount({
      customerReference,
      customerName,
      customerEmail: user.email,
      customerPhone: user.phoneNumber,
    });

    console.log("Paymonetra virtual account response:", JSON.stringify(response, null, 2));

    const responseData = response?.data || response;

    const bankName =
      responseData?.bank_name ||
      responseData?.bankName ||
      responseData?.bank ||
      "Wema Bank";

    const accountNumber =
      responseData?.account_number ||
      responseData?.accountNumber ||
      responseData?.account ||
      responseData?.account_no;

    const accountName =
      responseData?.account_name ||
      responseData?.accountName ||
      `ThimsLog - ${customerName}`;

    const virtualAccountReference =
      responseData?.reference ||
      responseData?.id ||
      responseData?.virtual_account_reference ||
      customerReference;

    if (!accountNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            response?.message ||
            "Unable to generate virtual account from provider at the moment. Please try again.",
        },
        { status: 502 }
      );
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        bankName,
        accountNumber: String(accountNumber),
        accountName,
        virtualAccountReference: String(virtualAccountReference),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Virtual account generated successfully",
      wallet: {
        id: updatedWallet.id,
        balance: Number(updatedWallet.balance),
        currency: updatedWallet.currency,
        bankName: updatedWallet.bankName,
        accountNumber: updatedWallet.accountNumber,
        accountName: updatedWallet.accountName,
        virtualAccountReference: updatedWallet.virtualAccountReference,
      },
    });
  } catch (error: any) {
    console.error("Generate virtual account error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to generate virtual account. Please check your network or try again shortly.",
      },
      { status: error?.status || 500 }
    );
  }
}
