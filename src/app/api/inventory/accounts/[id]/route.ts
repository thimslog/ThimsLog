import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";

// 1. UPDATE INVENTORY ACCOUNT (PUT & PATCH)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    // Await the dynamic URL ID parameter
    const { id } = await context.params;

    // Parse the payload from the request body
    const body = await req.json();
    const {
      accountTypeId,
      name,
      username,
      email,
      url,
      country,
      followers,
      status,
      notes,
      loginInstructions,
    } = body;

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
        ...(name !== undefined && { name: name ? String(name).trim() : null }),
        ...(username !== undefined && { username: username ? String(username).trim() : null }),
        ...(email !== undefined && { email: email ? String(email).trim() : null }),
        ...(url !== undefined && { url: url ? String(url).trim() : null }),
        ...(country !== undefined && { country: country ? String(country).trim() : null }),
        ...(followers !== undefined && {
          followers: followers !== null && followers !== undefined && followers !== "" ? Number(followers) : null,
        }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes: notes ? String(notes).trim() : null }),
        ...(loginInstructions !== undefined && {
          loginInstructions: loginInstructions ? String(loginInstructions).trim() : null,
        }),
      },
    });

    if (admin) {
      await recordAdminAudit(
        req,
        { id: admin.adminId, email: admin.email },
        {
          action: "ACCOUNT_UPDATED",
          entityId: id,
          entityType: "INVENTORY",
          entityLabel: updated.username || updated.name || id,
          description: `Admin ${admin.email} updated account item (@${updated.username || updated.name || id}) at ${nigeriaTime()}`,
          metadata: { status, username: updated.username, country: updated.country },
        }
      );
    }

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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(req, context);
}

// 2. DELETE INVENTORY ACCOUNT (DELETE)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
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

    if (admin) {
      await recordAdminAudit(
        req,
        { id: admin.adminId, email: admin.email },
        {
          action: "ACCOUNT_DELETED",
          entityId: id,
          entityType: "INVENTORY",
          entityLabel: account.username || account.name || id,
          description: `Admin ${admin.email} deleted account item (@${account.username || account.name || id}) at ${nigeriaTime()}`,
          metadata: { id, username: account.username },
        }
      );
    }

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
