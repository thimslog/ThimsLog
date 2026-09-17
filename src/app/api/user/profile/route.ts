import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import {
  getUsernameCooldownInfo,
  recordUsernameChange,
} from "@/lib/username-history-store";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check 3-month (90 days) cooldown via reliable store
    const cooldown = await getUsernameCooldownInfo(user.id);

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          usernameChangedAt: cooldown.lastChangedAt,
          canChangeUsername: cooldown.canChangeUsername,
          nextAllowedDate: cooldown.nextAllowedDate?.toISOString() || null,
          daysRemaining: cooldown.daysRemaining,
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
    let usernameIsChanging = false;

    if (
      userName &&
      userName.trim().toLowerCase().replace(/^@/, "") !==
        currentUser.userName.toLowerCase()
    ) {
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

      // Check 3-month (90 days) cooldown via reliable store
      const cooldown = await getUsernameCooldownInfo(currentUser.id);

      if (!cooldown.canChangeUsername && cooldown.nextAllowedDate) {
        const formattedDate = cooldown.nextAllowedDate.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );
        return NextResponse.json(
          {
            success: false,
            message: `You can only edit your username once every 3 months. You can change it again in ${cooldown.daysRemaining} day(s) on ${formattedDate}.`,
          },
          { status: 400 }
        );
      }

      // Check uniqueness across all users (case-insensitive)
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
      usernameIsChanging = true;
    }

    const updateData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(phoneNumber ? { phoneNumber: phoneNumber.trim() } : {}),
      ...(usernameIsChanging ? { userName: updatedUsername } : {}),
    };

    let updatedUser: any;
    try {
      if (usernameIsChanging) {
        updateData.usernameChangedAt = new Date();
      }

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
      // Fallback if usernameChangedAt column isn't in database table yet
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

    // If username was changed, record in persistent cooldown store
    if (usernameIsChanging) {
      await recordUsernameChange(currentUser.id, new Date());
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
