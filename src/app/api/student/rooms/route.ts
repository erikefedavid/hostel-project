import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Hostel from "@/models/Hostel";
import Room from "@/models/Room";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    
    // Find the logged-in student to check their gender
    const student = await User.findById(session.user.id);
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    if (!student.gender) {
      return NextResponse.json(
        { error: "Please update your gender in profile settings before choosing a room." },
        { status: 400 }
      );
    }

    // Fetch hostels matching the student's gender designation
    const hostels = await Hostel.find({ gender: student.gender }).sort({ name: 1 });

    // Fetch all rooms inside these eligible hostels and enrich them
    const enrichedHostels = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id }).sort({ block: 1, roomNumber: 1 });
        return {
          ...hostel.toObject(),
          rooms: rooms.map((room) => {
            const capacity = room.capacity || 4;
            const availableBeds = room.availableBeds;
            const occupied = capacity - availableBeds;
            return {
              ...room.toObject(),
              occupiedBeds: occupied,
              isFull: availableBeds === 0,
            };
          }),
        };
      })
    );

    return NextResponse.json({ hostels: enrichedHostels });
  } catch (error: any) {
    console.error("Fetch student hostels/rooms error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
