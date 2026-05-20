import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import User from "@/models/User";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";

const _User = User;
const _Room = Room;
const _Hostel = Hostel;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const application = await Application.findById(id)
      .populate("studentId", "-passwordHash")
      .populate({
        path: "roomId",
        populate: {
          path: "hostelId",
        },
      });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
