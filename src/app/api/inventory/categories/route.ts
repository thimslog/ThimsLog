import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    // In Next.js, you must await the JSON body parse
    const { name, description, status } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    const existingCategory = await prisma.inventoryCategory.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 },
      );
    }

    const category = await prisma.inventoryCategory.create({
      data: { name, description, status },
    });

    if (admin) {
      await recordAdminAudit(
        req,
        { id: admin.adminId, email: admin.email },
        {
          action: "CATEGORY_CREATED",
          entityId: category.id,
          entityType: "INVENTORY",
          entityLabel: category.name,
          description: `Admin ${admin.email} created category "${category.name}" at ${nigeriaTime()}`,
          metadata: { name, description, status },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const categories = await prisma.inventoryCategory.findMany({
      include: {
        accountTypes: {
          include: {
            accounts: {
              where: {
                status: "AVAILABLE",
              },
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                accounts: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedCategories = categories.map((category) => {
      const accountTypesCount = category.accountTypes?.length ?? 0;
      const availableAccountsCount = category.accountTypes?.reduce(
        (acc, type) => acc + (type.accounts?.length ?? 0),
        0
      ) ?? 0;
      const totalAccountsCount = category.accountTypes?.reduce(
        (acc, type) => acc + (type._count?.accounts ?? 0),
        0
      ) ?? 0;

      return {
        ...category,
        accountTypesCount,
        availableAccountsCount,
        totalAccountsCount,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: transformedCategories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 },
    );
  }
}
