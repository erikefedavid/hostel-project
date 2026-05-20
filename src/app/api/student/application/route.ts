import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import Semester from "@/models/Semester";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";

// Ensure files are registered in Mongoose so populates work properly
const _Room = Room;
const _Hostel = Hostel;

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    // Find the latest semester (open or closed)
    const latestSemester = await Semester.findOne().sort({ createdAt: -1 });
    if (!latestSemester) {
      return NextResponse.json({ application: null, semester: null });
    }

    // Find application for that semester
    const application = await Application.findOne({
      studentId: session.user.id,
      semester: latestSemester.label,
    }).populate({
      path: "roomId",
      populate: {
        path: "hostelId",
      },
    });

    return NextResponse.json({
      application,
      semester: latestSemester,
    });
  } catch (error: any) {
    console.error("Fetch application error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
