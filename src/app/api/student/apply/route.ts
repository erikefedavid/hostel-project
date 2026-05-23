import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Application from "@/models/Application";
import Semester from "@/models/Semester";
import Room from "@/models/Room";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    // Verify student profile details are complete before letting them apply!
    const student = await User.findById(session.user.id);
    if (!student || !student.gender || !student.level || !student.matricNumber) {
      return NextResponse.json(
        { error: "Please complete your profile (Matric Number, Gender, and Level) before applying." },
        { status: 400 }
      );
    }

    // Get currently open semester
    const activeSemester = await Semester.findOne({ isOpen: true });
    if (!activeSemester) {
      return NextResponse.json(
        { error: "Hostel applications are currently closed. No open semester found." },
        { status: 400 }
      );
    }

    const { notes, roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json(
        { error: "Please select a room to complete your hostel allocation." },
        { status: 400 }
      );
    }

    // Verify the room exists and has beds available
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "The selected room was not found." }, { status: 404 });
    }

    if (room.availableBeds <= 0) {
      return NextResponse.json(
        { error: `Room ${room.roomNumber} is fully occupied. Please select another room.` },
        { status: 400 }
      );
    }

    // Check if the student has already applied for this semester
    const existingApp = await Application.findOne({
      studentId: student._id,
      semester: activeSemester.label,
    });

    if (existingApp) {
      return NextResponse.json(
        { error: `You have already submitted an application for the ${activeSemester.label} semester.` },
        { status: 400 }
      );
    }

    // Perform atomic capacity updates and allocate the student!
    room.availableBeds -= 1;
    await room.save();

    const newApplication = await Application.create({
      studentId: student._id,
      semester: activeSemester.label,
      roomId: room._id,
      notes: notes || "",
      status: "ALLOCATED",
      submittedAt: new Date(),
      allocatedAt: new Date(),
    });

    return NextResponse.json({
      message: "Room booked and allocated successfully!",
      application: newApplication,
    });
  } catch (error: any) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
