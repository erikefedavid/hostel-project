import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Semester from "@/models/Semester";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const latestSemester = await Semester.findOne().sort({ createdAt: -1 });

    return NextResponse.json({ semester: latestSemester });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { label, isOpen } = body;

    if (!label) {
      return NextResponse.json({ error: "Semester label is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if semester exists
    let semester = await Semester.findOne({ label });

    if (!semester) {
      // If setting to open, make sure all other semesters are closed first!
      if (isOpen) {
        await Semester.updateMany({}, { isOpen: false, closedAt: new Date() });
      }

      semester = await Semester.create({
        label,
        isOpen: !!isOpen,
        openedAt: new Date(),
      });
    } else {
      if (isOpen && !semester.isOpen) {
        // If opening this, close others
        await Semester.updateMany({ _id: { $ne: semester._id } }, { isOpen: false, closedAt: new Date() });
      }

      semester.isOpen = !!isOpen;
      if (!isOpen) {
        semester.closedAt = new Date();
      } else {
        semester.closedAt = null;
      }
      await semester.save();
    }

    return NextResponse.json({
      message: `Semester ${semester.label} applications are now ${semester.isOpen ? "OPEN" : "CLOSED"}.`,
      semester,
    });
  } catch (error: any) {
    console.error("Semester save error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
