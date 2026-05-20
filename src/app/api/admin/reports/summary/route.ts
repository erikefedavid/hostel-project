import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import User from "@/models/User";
import Semester from "@/models/Semester";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    // Fetch latest semester
    const latestSemester = await Semester.findOne().sort({ createdAt: -1 });
    if (!latestSemester) {
      return NextResponse.json({
        summary: {
          totalApplications: 0,
          allocatedCount: 0,
          notAllocatedCount: 0,
          pendingCount: 0,
          genderBreakdown: { male: 0, female: 0 },
          levelBreakdown: { "100": 0, "200": 0, "300": 0, "400": 0, "500": 0 },
        },
      });
    }

    const label = latestSemester.label;

    // Applications for active semester
    const apps = await Application.find({ semester: label }).populate("studentId");

    const totalApplications = apps.length;
    let allocatedCount = 0;
    let notAllocatedCount = 0;
    let pendingCount = 0;

    const genderBreakdown = { male: 0, female: 0 };
    const levelBreakdown: Record<string, number> = { "100": 0, "200": 0, "300": 0, "400": 0, "500": 0 };

    apps.forEach((app) => {
      if (app.status === "ALLOCATED") allocatedCount++;
      else if (app.status === "NOT_ALLOCATED") notAllocatedCount++;
      else pendingCount++;

      const student = app.studentId as any;
      if (student) {
        if (student.gender === "male") genderBreakdown.male++;
        if (student.gender === "female") genderBreakdown.female++;
        
        if (student.level && levelBreakdown[student.level] !== undefined) {
          levelBreakdown[student.level]++;
        }
      }
    });

    return NextResponse.json({
      semester: label,
      summary: {
        totalApplications,
        allocatedCount,
        notAllocatedCount,
        pendingCount,
        genderBreakdown,
        levelBreakdown,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
