import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust to your prisma client path

// GET /api/inventory/account-types/:accountTypeId
// Detail page: the AccountType summary + its AVAILABLE InventoryAccount rows
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountTypeId: string }> },
) {
  const { accountTypeId } = await params;

  try {
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
      data: {
        id: accountType.id,
        name: accountType.name,
        description: accountType.description,
        price: Number(accountType.price),
        category: accountType.category.name,
        available: accountType.accounts.length,
        accounts: accountType.accounts.map((a) => ({
          id: a.id,
          username: a.username ?? a.name,
          email: a.email,
          country: a.country,
          followers: a.followers,
          status: a.status,
          notes: a.notes,
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
