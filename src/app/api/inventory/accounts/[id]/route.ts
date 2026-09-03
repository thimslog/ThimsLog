import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. UPDATE INVENTORY ACCOUNT (PUT)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the dynamic URL ID parameter
    const { id } = await context.params;

    // Parse the payload from the request body
    const {
      accountTypeId,
      name,
      username,
      email,
      country,
      followers,
      status,
      notes,
    } = await req.json();

    const account = await prisma.inventoryAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.inventoryAccount.update({
      where: { id },
      data: {
        ...(accountTypeId !== undefined && { accountTypeId }),
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(country !== undefined && { country }),
        ...(followers !== undefined && { followers }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update inventory account error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update account" },
      { status: 500 }
    );
  }
}

// 2. DELETE INVENTORY ACCOUNT (DELETE)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the dynamic URL ID parameter
    const { id } = await context.params;

    const account = await prisma.inventoryAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    await prisma.inventoryAccount.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory account error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
