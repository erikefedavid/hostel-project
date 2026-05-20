import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const users = await User.find({}, "-passwordHash").sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and Role are required" },
        { status: 400 }
      );
    }

    // A superadmin shouldn't demote themselves accidentally
    if (userId === session.user.id && role !== "superadmin") {
      return NextResponse.json(
        { error: "You cannot change your own superadmin role" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({ message: "User role updated successfully", user });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
