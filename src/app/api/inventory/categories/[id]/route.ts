import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next.js passes dynamic URL parameters in the second argument context
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // In newer Next.js versions, params must be awaited
    const { id } = await context.params;

    // Read the payload from the request body
    const { name, description, status } = await req.json();

    const category = await prisma.inventoryCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    const updatedCategory = await prisma.inventoryCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Await the dynamic URL parameter context
    const { id } = await context.params;

    const category = await prisma.inventoryCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    await prisma.inventoryCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
