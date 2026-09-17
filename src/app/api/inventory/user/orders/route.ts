import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

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

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        accountType: {
          include: {
            category: true,
          },
        },
        accounts: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = orders.map((o) => ({
      id: o.id,
      quantity: o.quantity,
      unitPrice: Number(o.unitPrice),
      totalAmount: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt,
      accountType: o.accountType
        ? {
            id: o.accountType.id,
            name: o.accountType.name,
            category: o.accountType.category?.name,
          }
        : null,
      accounts: o.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        username: a.username,
        email: a.email,
        url: a.url,
        country: a.country,
        followers: a.followers,
        notes: a.notes,
        loginInstructions: a.loginInstructions,
        status: a.status,
      })),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Get user orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
