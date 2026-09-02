import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/jwt";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();


    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          admin: null,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin retrieved successfully",
        admin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get current admin error:", error);

    return NextResponse.json(
      {
        success: false,
        admin: null,
        message: "Unable to get current admin",
      },
      { status: 500 },
    );
  }
}
