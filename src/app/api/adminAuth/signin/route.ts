import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createAdminJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const remember = Boolean(body.remember);

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    if (!admin.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account has not been activated. Please use the invitation email to set your password.",
        },
        { status: 403 },
      );
    }

    if (!admin.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account does not have a password yet. Please use your invitation link.",
        },
        { status: 403 },
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
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

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          admin: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            userName: admin.userName,
            role: admin.role,
          },
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      name: "admin_auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: remember
        ? 60 * 60 * 24 * 30 // 30 days
        : 60 * 60 * 24, // 1 day
    });

    // Update login information
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        lastLoggedIn: new Date(),
        loggedInTimes: {
          increment: 1,
        },
      },
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to login",
      },
      { status: 500 },
    );
  }
}