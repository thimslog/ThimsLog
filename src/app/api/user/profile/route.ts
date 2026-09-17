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

    // Check 3-month (90 days) cooldown
    const usernameChangedAt = (user as any).usernameChangedAt
      ? new Date((user as any).usernameChangedAt)
      : null;

    const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;
    const now = new Date();

    let canChangeUsername = true;
    let nextAllowedDate: Date | null = null;
    let daysRemaining = 0;

    if (usernameChangedAt) {
      nextAllowedDate = new Date(usernameChangedAt.getTime() + threeMonthsMs);
      if (now < nextAllowedDate) {
        canChangeUsername = false;
        daysRemaining = Math.ceil(
          (nextAllowedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          usernameChangedAt,
          canChangeUsername,
          nextAllowedDate: nextAllowedDate?.toISOString() || null,
          daysRemaining,
        },
      },
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
    const { firstName, lastName, phoneNumber, userName } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { success: false, message: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Check if phone number is being changed and if it is already taken
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

    // Check if username is being changed
    let updatedUsername = currentUser.userName;
    let newUsernameChangedAt: Date | undefined = undefined;

    if (userName && userName.trim() !== currentUser.userName) {
      const cleanUsername = userName.trim().toLowerCase().replace(/^@/, "");

      // Validation rule: 3-30 alphanumeric or underscore
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username must be 3-30 characters long and contain only letters, numbers, and underscores.",
          },
          { status: 400 }
        );
      }

      // Check 3-month (90 days) cooldown
      const lastChanged = (currentUser as any).usernameChangedAt
        ? new Date((currentUser as any).usernameChangedAt)
        : null;

      if (lastChanged) {
        const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;
        const nextAllowed = new Date(lastChanged.getTime() + threeMonthsMs);
        if (new Date() < nextAllowed) {
          const days = Math.ceil(
            (nextAllowed.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const formattedDate = nextAllowed.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return NextResponse.json(
            {
              success: false,
              message: `You can only edit your username once every 3 months. You can change it again in ${days} day(s) on ${formattedDate}.`,
            },
            { status: 400 }
          );
        }
      }

      // Check uniqueness
      const existingUsername = await prisma.user.findFirst({
        where: {
          userName: {
            equals: cleanUsername,
            mode: "insensitive",
          },
          id: { not: currentUser.id },
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          {
            success: false,
            message: `@${cleanUsername} is already taken. Please choose another username.`,
          },
          { status: 400 }
        );
      }

      updatedUsername = cleanUsername;
      newUsernameChangedAt = new Date();
    }

    const updateData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(phoneNumber ? { phoneNumber: phoneNumber.trim() } : {}),
      ...(updatedUsername !== currentUser.userName ? { userName: updatedUsername } : {}),
    };

    // Attempt to set usernameChangedAt if field exists
    if (newUsernameChangedAt) {
      try {
        updateData.usernameChangedAt = newUsernameChangedAt;
      } catch {}
    }

    let updatedUser: any;
    try {
      updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: updateData,
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
    } catch (dbErr: any) {
      // Fallback if usernameChangedAt column isn't in database yet
      if (updateData.usernameChangedAt) {
        delete updateData.usernameChangedAt;
        updatedUser = await prisma.user.update({
          where: { id: currentUser.id },
          data: updateData,
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
      } else {
        throw dbErr;
      }
    }

    // Refresh token with updated details
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
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
