import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("-passwordHash");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, gender, level, specialNeeds } = body;

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if there is an active application. If yes, prevent changing critical details like gender.
    // However, if the user doesn't have an application, they can update everything.
    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (level) user.level = level;
    if (typeof specialNeeds === "boolean") user.specialNeeds = specialNeeds;

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully!",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
        level: user.level,
        specialNeeds: user.specialNeeds,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
