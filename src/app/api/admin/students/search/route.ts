import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Application from "@/models/Application";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json({ students: [] });
    }

    await dbConnect();

    // Find students matching query (name or matric)
    const students = await User.find({
      role: "student",
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { matricNumber: { $regex: query, $options: "i" } },
      ],
    })
      .select("-passwordHash")
      .limit(10);

    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
