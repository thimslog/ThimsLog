import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";

// 1. CREATE ACCOUNT TYPE (POST)
export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    const { name, description, price, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name and categoryId are required" },
        { status: 400 },
      );
    }

    const category = await prisma.inventoryCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    const existingType = await prisma.accountType.findUnique({
      where: {
        categoryId_name: {
          categoryId,
          name,
        },
      },
    });

    if (existingType) {
      return NextResponse.json(
        {
          success: false,
          message: "Account type already exists in this category",
        },
        { status: 409 },
      );
    }

    const accountType = await prisma.accountType.create({
      data: {
        name,
        description,
        price,
        categoryId,
      },
    });

    if (admin) {
      await recordAdminAudit(
        req,
        { id: admin.adminId, email: admin.email },
        {
          action: "PRODUCT_CREATED",
          entityId: accountType.id,
          entityType: "INVENTORY",
          entityLabel: accountType.name,
          description: `Admin ${admin.email} created product "${accountType.name}" in category "${category.name}" at ${nigeriaTime()}`,
          metadata: { name, description, price, categoryName: category.name },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account type created successfully",
        data: accountType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create account type error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create account type" },
      { status: 500 },
    );
  }
}

// 2. GET ACCOUNT TYPES (GET)
export async function GET(req: Request) {
  try {
    // Next.js parses query strings (?categoryId=...) via the request URL object
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const accountTypes = await prisma.accountType.findMany({
      where: categoryId
        ? {
            categoryId: String(categoryId),
          }
        : undefined,
      include: {
        category: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedAccountTypes = accountTypes.map((type) => {
      const availableAccountsCount = type.accounts?.length ?? 0;
      const totalAccountsCount = type._count?.accounts ?? 0;

      return {
        ...type,
        availableAccountsCount,
        totalAccountsCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedAccountTypes,
    });
  } catch (error) {
    console.error("Get account types error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch account types" },
      { status: 500 },
    );
  }
}
