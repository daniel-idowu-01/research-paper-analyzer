import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      response.cookies.delete("token");
      return response;
    }

    const user = await verifyToken(token);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user", JSON.stringify(user));
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    const response = NextResponse.redirect(new URL("/auth/login", req.url));
    response.cookies.delete("token");
    return response;
  }
}

// Apply middleware only to protected routes
export const config = {
  matcher: [
    "/my-papers",
    "/profile",
    "/settings",
   // "/api/protected/:path*",
  ],
};
