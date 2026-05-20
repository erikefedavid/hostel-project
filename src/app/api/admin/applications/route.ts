import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import User from "@/models/User";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";

// Ensure registrations
const _User = User;
const _Room = Room;
const _Hostel = Hostel;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const gender = searchParams.get("gender") || "";
    const status = searchParams.get("status") || "";
    const semester = searchParams.get("semester") || "";

    await dbConnect();

    // 1. Build user match query for searching by fullName / matricNumber / level / gender
    const userQuery: any = {};
    if (search) {
      userQuery.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { matricNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (level) {
      userQuery.level = level;
    }
    if (gender) {
      userQuery.gender = gender;
    }

    // Find users matching these conditions
    const matchingUsers = await User.find(userQuery).select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    // 2. Build application query
    const appQuery: any = {
      studentId: { $in: userIds },
    };

    if (status) {
      appQuery.status = status;
    }
    if (semester) {
      appQuery.semester = semester;
    }

    // Fetch all applications
    const applications = await Application.find(appQuery)
      .populate("studentId", "-passwordHash")
      .populate({
        path: "roomId",
        populate: {
          path: "hostelId",
        },
      })
      .sort({ submittedAt: -1 });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("List applications error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
