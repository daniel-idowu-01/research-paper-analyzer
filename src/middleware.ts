import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log(`Middleware hit: ${req.method} ${req.url}`);
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("middleware payload: " + payload);

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // req.cookies.delete("token");
      (await cookieStore).delete("token");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const user = await verifyToken(token);
    req.headers.set("x-user", JSON.stringify(user));
    return NextResponse.next();
  } catch (error: any) {
    console.error(error.message || error);
    (await cookieStore).delete("token");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

// Apply middleware only to protected routes
export const config = {
  runtime: "nodejs",
  matcher: [
    "/my-papers",
    "/profile",
    "/settings",
   // "/api/protected/:path*",
  ],
};
