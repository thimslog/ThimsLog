import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json(
        { valid: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username")?.trim().replace(/^@/, "");

    if (!rawUsername || rawUsername.length < 2) {
      return NextResponse.json(
        { valid: false, message: "Please provide a valid username" },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findFirst({
      where: {
        userName: {
          equals: rawUsername,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        userName: true,
        firstName: true,
        lastName: true,
        wallet: {
          select: { id: true },
        },
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { valid: false, message: `@${rawUsername} not found on Thimslog` },
        { status: 404 }
      );
    }

    if (recipient.id === currentUser.id) {
      return NextResponse.json(
        { valid: false, message: "You cannot transfer funds to your own account" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: recipient.id,
        userName: recipient.userName,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        fullName: `${recipient.firstName} ${recipient.lastName}`.trim(),
      },
    });
  } catch (error: any) {
    console.error("Recipient lookup error:", error);
    return NextResponse.json(
      { valid: false, message: error?.message || "Failed to lookup recipient" },
      { status: 500 }
    );
  }
}
