import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import logger from "@/lib/logger";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    logger.info("Login request received...");
    await connectDB();
    const { email, password, rememberMe } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    if (!token) {
      return NextResponse.json(
        { error: "Failed to generate token" },
        { status: 500 }
      );
    }

    // const maxAgeInSeconds = 60 * 60 * 24 * 7;
    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "strict",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          autoAnalyze: user.settings.preferences.autoAnalyze,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Login error: " + error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
