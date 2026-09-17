import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { available: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username")?.trim().replace(/^@/, "");

    if (!rawUsername) {
      return NextResponse.json({
        available: false,
        message: "Please provide a username",
      });
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(rawUsername)) {
      return NextResponse.json({
        available: false,
        message: "3-30 characters, letters, numbers & underscores only",
      });
    }

    if (rawUsername.toLowerCase() === user.userName.toLowerCase()) {
      return NextResponse.json({
        available: true,
        isCurrent: true,
        message: "Current username",
      });
    }

    const existing = await prisma.user.findFirst({
      where: {
        userName: {
          equals: rawUsername,
          mode: "insensitive",
        },
        id: { not: user.id },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        message: `@${rawUsername} is already taken`,
      });
    }

    return NextResponse.json({
      available: true,
      message: `@${rawUsername} is available!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { available: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
