import bcrypt from "bcryptjs";
import User from "@/models/User";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import { emailRegex, passwordRegex } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    logger.info("Signup request received...");
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (name.length < 3) {
      return NextResponse.json(
        {
          message: "Your first name or last name should more than 2 characters",
        },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email!" },
        { status: 400 }
      );
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must have at least one uppercase, one lowercase, one number, one symbol, and be more than 8 characters!",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
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
