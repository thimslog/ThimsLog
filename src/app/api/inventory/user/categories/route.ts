import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust to your prisma client path

// GET /api/inventory/categories
// Public catalog: categories -> account types, with live available counts
export async function GET() {
  try {
    const categories = await prisma.inventoryCategory.findMany({
      where: { status: "ACTIVE" },
      include: {
        accountTypes: {
          include: {
            _count: { select: { accounts: { where: { status: "AVAILABLE" } } } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      accountTypes: c.accountTypes.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        price: Number(t.price),
        available: t._count.accounts,
      })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("getCategories error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
  }
}