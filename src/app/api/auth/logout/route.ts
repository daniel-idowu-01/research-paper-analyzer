import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/server/auth";

export async function GET() {
  await clearAuthCookie();
  return NextResponse.json({ message: "Logged out" });
}
