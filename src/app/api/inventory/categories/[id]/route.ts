import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";

// Next.js passes dynamic URL parameters in the second argument context
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
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

    if (admin) {
      await recordAdminAudit(
        req,
        { id: admin.adminId, email: admin.email },
        {
          action: "CATEGORY_UPDATED",
          entityId: id,
          entityType: "INVENTORY",
          entityLabel: updatedCategory.name,
          description: `Admin ${admin.email} updated category "${updatedCategory.name}" at ${nigeriaTime()}`,
          metadata: { name, description, status },
        }
      );
    }

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
    const admin = await getCurrentAdmin();
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

    if (admin) {
      await recordAdminAudit(
        req,
        { id: admin.adminId, email: admin.email },
        {
          action: "CATEGORY_DELETED",
          entityId: id,
          entityType: "INVENTORY",
          entityLabel: category.name,
          description: `Admin ${admin.email} deleted category "${category.name}" at ${nigeriaTime()}`,
          metadata: { id, name: category.name },
        }
      );
    }

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
