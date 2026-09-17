import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { createAdminJWT } from "@/lib/jwt";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email: user.email.trim().toLowerCase(),
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "You do not have administrative access." },
        { status: 403 }
      );
    }

    if (admin.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Your admin account is inactive or suspended." },
        { status: 403 }
      );
    }

    const token = await createAdminJWT({
      adminId: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      userName: admin.userName ?? "",
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Switching to Admin Portal...",
      redirectUrl: "/admin/dashboard",
    });

    response.cookies.set({
      name: "admin_auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error("Switch to admin error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to switch to admin portal" },
      { status: 500 }
    );
  }
}
