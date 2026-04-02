import bcrypt from "bcryptjs";
import User from "@/models/User";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { setAuthCookie, signUserToken } from "@/lib/server/auth";
import { badRequest, unauthorized } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    logger.info("Login request received...");
    await connectDB();
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return badRequest("Email and password are required.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return unauthorized("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return unauthorized("Invalid credentials");
    }

    const token = signUserToken(
      { id: user._id, email: user.email, name: user.name },
      Boolean(rememberMe)
    );

    await setAuthCookie(token, Boolean(rememberMe));

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Login error: " + error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
