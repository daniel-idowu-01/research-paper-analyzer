import bcrypt from "bcryptjs";
import User from "@/models/User";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import { emailRegex, passwordRegex } from "@/lib/constants";
import { badRequest } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    logger.info("Signup request received...");
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return badRequest("All fields are required");
    }

    if (name.length < 3) {
      return badRequest("Your full name should be at least 3 characters long.");
    }

    if (!emailRegex.test(email)) {
      return badRequest("Enter a valid email.");
    }

    if (!passwordRegex.test(password)) {
      return badRequest(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol."
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return badRequest("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await Notification.create({
      userId: newUser.id,
      type: "system_alert",
      title: `Welcome to our system, ${newUser.name.split(" ")[0] || newUser.name}!`,
      message: "Thank you for signing up! We hope you have a smooth ride.",
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Signup error: " + error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
