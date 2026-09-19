import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, createAdminJWT, setAdminCookie } from "@/lib/jwt";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";

// GET current admin's full profile
export async function GET() {
  try {
    const adminPayload = await getCurrentAdmin();
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminPayload.adminId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoggedIn: true,
        loggedInTimes: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error: any) {
    console.error("GET admin profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH / PUT update admin profile and/or change password
export async function PATCH(request: NextRequest) {
  try {
    const adminPayload = await getCurrentAdmin();
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      userName,
      currentPassword,
      newPassword,
      confirmPassword,
    } = body;

    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminPayload.adminId },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin account not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, any> = {};

    // 1. Profile field updates
    if (firstName && typeof firstName === "string") {
      updateData.firstName = firstName.trim();
    }
    if (lastName && typeof lastName === "string") {
      updateData.lastName = lastName.trim();
    }
    if (userName && typeof userName === "string") {
      const trimmedUser = userName.trim().toLowerCase();
      if (trimmedUser !== existingAdmin.userName?.toLowerCase()) {
        const usernameTaken = await prisma.admin.findUnique({
          where: { userName: trimmedUser },
        });
        if (usernameTaken && usernameTaken.id !== existingAdmin.id) {
          return NextResponse.json(
            { success: false, message: "Username is already taken by another admin" },
            { status: 400 }
          );
        }
        updateData.userName = trimmedUser;
      }
    }

    // 2. Password change validation (if requested)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, message: "New password and confirmation do not match" },
          { status: 400 }
        );
      }

      const isCurrentCorrect = await bcrypt.compare(
        currentPassword,
        existingAdmin.password
      );

      if (!isCurrentCorrect) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid changes provided" },
        { status: 400 }
      );
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: existingAdmin.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Refresh JWT session cookie with latest name & username
    const newToken = await createAdminJWT({
      adminId: updatedAdmin.id,
      email: updatedAdmin.email,
      firstName: updatedAdmin.firstName,
      lastName: updatedAdmin.lastName,
      userName: updatedAdmin.userName ?? "",
      role: updatedAdmin.role,
    });
    await setAdminCookie(newToken);

    // Record Audit Log
    await recordAdminAudit(
      request,
      { id: updatedAdmin.id, email: updatedAdmin.email },
      {
        action: newPassword ? "ADMIN_PASSWORD_CHANGED" : "ADMIN_PROFILE_UPDATED",
        entityId: updatedAdmin.id,
        entityType: "ADMIN",
        entityLabel: updatedAdmin.email,
        description: newPassword
          ? `Admin ${updatedAdmin.email} updated profile details and changed password at ${nigeriaTime()}`
          : `Admin ${updatedAdmin.email} updated profile details at ${nigeriaTime()}`,
        metadata: {
          updatedFields: Object.keys(updateData).filter((k) => k !== "password"),
          hasPasswordChanged: !!newPassword,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: newPassword
        ? "Profile and password updated successfully"
        : "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error: any) {
    console.error("Update admin profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
