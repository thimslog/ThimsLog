import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, url, section, iconType, order, isActive } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (description !== undefined) dataToUpdate.description = description?.trim() || null;
    if (url !== undefined) dataToUpdate.url = url.trim();
    if (section !== undefined) dataToUpdate.section = section.trim();
    if (iconType !== undefined) dataToUpdate.iconType = iconType.trim();
    if (order !== undefined) dataToUpdate.order = Number(order);
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    let updatedLink = null;
    try {
      if ((prisma as any).helpCenterLink) {
        const existing = await (prisma as any).helpCenterLink.findUnique({
          where: { id },
        });

        if (existing) {
          updatedLink = await (prisma as any).helpCenterLink.update({
            where: { id },
            data: dataToUpdate,
          });
        } else {
          // If record wasn't found in DB (e.g. default placeholder), create it
          updatedLink = await (prisma as any).helpCenterLink.create({
            data: {
              title: dataToUpdate.title || "Help Resource",
              description: dataToUpdate.description || null,
              url: dataToUpdate.url || "#",
              section: dataToUpdate.section || "WHATSAPP_CHANNEL",
              iconType: dataToUpdate.iconType || "whatsapp",
              order: dataToUpdate.order ?? 0,
              isActive: dataToUpdate.isActive ?? true,
            },
          });
        }
      }
    } catch (dbErr: any) {
      console.error("Failed to update in DB:", dbErr);
      return NextResponse.json(
        { success: false, message: "Database update error: " + (dbErr?.message || "") },
        { status: 500 }
      );
    }

    // Record Audit Log
    await recordAdminAudit(
      req,
      { id: admin.adminId, email: admin.email },
      {
        action: "HELP_LINK_UPDATED",
        entityId: id,
        entityType: "HELP_CENTER",
        entityLabel: updatedLink?.title || title || id,
        description: `Admin ${admin.email} updated help resource link "${updatedLink?.title || title || id}" at ${nigeriaTime()}`,
        metadata: dataToUpdate,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Help Center link updated successfully",
      data: updatedLink,
    });
  } catch (error: any) {
    console.error("Admin update help center link error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    let deletedTitle = id;

    try {
      if ((prisma as any).helpCenterLink) {
        const existing = await (prisma as any).helpCenterLink.findUnique({
          where: { id },
        });
        if (existing) {
          deletedTitle = existing.title;
          await (prisma as any).helpCenterLink.delete({
            where: { id },
          });
        }
      }
    } catch (dbErr: any) {
      console.error("Failed to delete in DB:", dbErr);
      return NextResponse.json(
        { success: false, message: "Database delete error: " + (dbErr?.message || "") },
        { status: 500 }
      );
    }

    // Record Audit Log
    await recordAdminAudit(
      req,
      { id: admin.adminId, email: admin.email },
      {
        action: "HELP_LINK_DELETED",
        entityId: id,
        entityType: "HELP_CENTER",
        entityLabel: deletedTitle,
        description: `Admin ${admin.email} deleted help resource link "${deletedTitle}" at ${nigeriaTime()}`,
        metadata: { id, title: deletedTitle },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Help Center link deleted successfully",
    });
  } catch (error: any) {
    console.error("Admin delete help center link error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete link" },
      { status: 500 }
    );
  }
}
