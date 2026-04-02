import User from "@/models/User";
import logger from "@/lib/logger";
import Paper from "@/models/Paper";
import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/server/auth";
import { badRequest, notFound } from "@/lib/server/http";

// get user profile
export async function GET(request: Request) {
  try {
    logger.info("Fetching user profile...");
    await connectDB();
    const authUser = await requireAuth();
    const user = await User.findById(authUser.id);

    if (!user) {
      return notFound("User not found");
    }

    const papersCount = await Paper.countDocuments({ uploaderId: user._id });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      institution: user.institution,
      position: user.position,
      website: user.website,
      researchInterests: user.researchInterests,
      papersCount: papersCount.toString(),
      autoAnalyze: user.settings.preferences.autoAnalyze,
      createdAt: user.createdAt.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
    };

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.message)) {
      return authErrorResponse(error);
    }

    logger.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// update user profile
export async function PUT(request: Request) {
  try {
    await connectDB();
    const authUser = await requireAuth();
    const { name, bio, institution, position, website, researchInterests } =
      await request.json();

    if (!name?.trim()) {
      return badRequest("Name is required.");
    }

    const user = await User.findByIdAndUpdate(
      authUser.id,
      {
        name: name.trim(),
        bio: bio?.trim() || "",
        institution: institution?.trim() || "",
        position: position?.trim() || "",
        website: website?.trim() || "",
        researchInterests: Array.isArray(researchInterests)
          ? researchInterests.map((item: string) => item.trim()).filter(Boolean)
          : [],
      },
      { new: true }
    );

    if (!user) {
      return notFound("User not found");
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.message)) {
      return authErrorResponse(error);
    }

    logger.error("Profile update error: " + error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
