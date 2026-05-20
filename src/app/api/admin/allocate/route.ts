import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Semester from "@/models/Semester";
import { runAllocationEngine } from "@/lib/allocation";

export async function POST() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    // Fetch the active semester
    const activeSemester = await Semester.findOne({ isOpen: true });
    if (!activeSemester) {
      return NextResponse.json(
        { error: "No open semester found. Please open an application window in settings before running allocation." },
        { status: 400 }
      );
    }

    // Run the allocation engine!
    const summary = await runAllocationEngine(activeSemester.label);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Auto allocation trigger error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
