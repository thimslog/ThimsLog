import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
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

    return NextResponse.json(
      {
        success: true,
        data: categories,
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
