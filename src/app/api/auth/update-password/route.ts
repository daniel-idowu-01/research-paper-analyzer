import bcrypt from "bcryptjs";
import User from "@/models/User";
import logger from "@/lib/logger";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/server/auth";
import { badRequest, notFound } from "@/lib/server/http";
import { passwordRegex } from "@/lib/constants";

export async function PUT(request: Request) {
  try {
    await connectDB();
    const authUser = await requireAuth();

    try {
      const { currentPassword, newPassword, confirmNewPassword } =
        await request.json();

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return badRequest("All fields are required.");
      }

      if (currentPassword === newPassword) {
        return badRequest("New password cannot be the same as the old password.");
      }

      if (newPassword !== confirmNewPassword) {
        return badRequest("Passwords do not match.");
      }

      if (!passwordRegex.test(newPassword)) {
        return badRequest(
          "Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol."
        );
      }

      const user = await User.findById(authUser.id);
      if (!user) {
        return notFound("User not found");
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return badRequest("Current password is not correct.");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.findByIdAndUpdate(
        user.id,
        { password: hashedPassword },
        { new: true }
      );

      return NextResponse.json(
        { message: "Password updated successfully" },
        { status: 200 }
      );
    } catch (error) {
      logger.error("Password update request failed: " + error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.message)) {
      return authErrorResponse(error);
    }

    logger.error("Password update error: " + error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
