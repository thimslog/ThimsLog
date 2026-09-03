import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. UPDATE ACCOUNT TYPE (PATCH)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Await the dynamic URL ID parameter
    const { id } = await context.params;

    // Parse the payload from the request body
    const { name, description, price, categoryId } = await req.json();

    const accountType = await prisma.accountType.findUnique({
      where: { id },
    });

    if (!accountType) {
      return NextResponse.json(
        { success: false, message: "Account type not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.accountType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(categoryId !== undefined && { categoryId }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account type updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update account type error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update account type" },
      { status: 500 },
    );
  }
}

// 2. DELETE ACCOUNT TYPE (DELETE)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Await the dynamic URL ID parameter
    const { id } = await context.params;

    const accountType = await prisma.accountType.findUnique({
      where: { id },
    });

    if (!accountType) {
      return NextResponse.json(
        { success: false, message: "Account type not found" },
        { status: 404 },
      );
    }

    await prisma.accountType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Account type deleted successfully",
    });
  } catch (error) {
    console.error("Delete account type error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete account type" },
      { status: 500 },
    );
  }
}
