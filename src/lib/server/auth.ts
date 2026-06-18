import jwt, { TokenExpiredError } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
})();

export type AuthenticatedUser = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
};

export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function requireAuth() {
  const token = await getTokenFromCookies();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    return jwt.verify(token, JWT_SECRET) as unknown as AuthenticatedUser;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }

    throw new Error("UNAUTHORIZED");
  }
}

export function signUserToken(
  payload: AuthenticatedUser,
  rememberMe = false
) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : "1d",
  });
}

export async function setAuthCookie(token: string, rememberMe = false) {
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    sameSite: "lax",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}

export async function getOrCreateAnonymousDeviceId(): Promise<string> {
  const cookieStore = await cookies();
  let deviceId = cookieStore.get("anonymous_device_id")?.value;

  if (!deviceId) {
    deviceId = uuidv4();
    cookieStore.set("anonymous_device_id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return deviceId;
}

export function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNAUTHORIZED";

  if (message === "TOKEN_EXPIRED") {
    return NextResponse.json(
      { error: "Token expired. Please login again." },
      { status: 401 }
    );
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
