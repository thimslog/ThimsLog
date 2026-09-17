import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

// GET /api/inventory/user/account-types/:accountTypeId
// Detail page: the AccountType summary + its AVAILABLE InventoryAccount rows + user wallet
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountTypeId: string }> },
) {
  const { accountTypeId } = await params;

  try {
    const userData = await getCurrentUser();
    let walletBalance = 0;
    if (userData?.id) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: userData.id },
      });
      if (wallet) {
        walletBalance = Number(wallet.balance);
      }
    }

    const accountType = await prisma.accountType.findUnique({
      where: { id: accountTypeId },
      include: {
        category: true,
        accounts: {
          where: { status: "AVAILABLE" },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!accountType) {
      return NextResponse.json(
        { success: false, message: "Account type not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      walletBalance,
      data: {
        id: accountType.id,
        name: accountType.name,
        description: accountType.description,
        price: Number(accountType.price),
        category: accountType.category.name,
        available: accountType.accounts.length,
        accounts: accountType.accounts.map((a) => ({
          id: a.id,
          name: a.name,
          username: a.username ?? a.name ?? a.id.slice(0, 10),
          email: a.email,
          url: a.url,
          country: a.country,
          followers: a.followers,
          status: a.status,
          notes: a.notes,
          loginInstructions: a.loginInstructions,
        })),
      },
    });
  } catch (error) {
    console.error("getAccountTypeDetail error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch account type" },
      { status: 500 },
    );
  }
}
