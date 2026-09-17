import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phoneNumber } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { success: false, message: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Check if phone number is being changed and if it is already taken by another user
    if (phoneNumber && phoneNumber.trim() !== currentUser.phoneNumber) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phoneNumber: phoneNumber.trim(),
          id: { not: currentUser.id },
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          { success: false, message: "Phone number is already in use" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(phoneNumber ? { phoneNumber: phoneNumber.trim() } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        userName: true,
        createdAt: true,
        wallet: { select: { balance: true } },
      },
    });

    // Refresh token with updated name
    const newToken = generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      userName: updatedUser.userName,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

    response.cookies.set("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
