import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/get-current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User retrieved successfully",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        success: false,
        user: null,
        message: "Unable to get current user",
      },
      { status: 500 },
    );
  }
}
