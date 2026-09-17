import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/jwt";

export async function POST() {
  try {
    await clearAdminCookie();
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
    response.cookies.delete("admin_auth_token");
    return response;
  } catch (error) {
    console.error("Admin signout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to sign out" },
      { status: 500 }
    );
  }
}
