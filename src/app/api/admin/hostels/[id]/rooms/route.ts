import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";

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

    const rooms = await Room.find({ hostelId: id }).sort({ block: 1, roomNumber: 1 });
    return NextResponse.json({ rooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const { roomNumber, floor, capacity, block } = await req.json();

    if (!roomNumber || floor === undefined || !capacity || !block) {
      return NextResponse.json(
        { error: "Room number, floor, capacity, and block are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify hostel exists
    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    // Check if room number already exists in this block of this hostel
    const existingRoom = await Room.findOne({
      hostelId: id,
      block: block.trim(),
      roomNumber: roomNumber.trim(),
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: `Room ${roomNumber} already exists in ${block} of this hostel.` },
        { status: 400 }
      );
    }

    const newRoom = await Room.create({
      hostelId: id,
      roomNumber: roomNumber.trim(),
      floor: Number(floor),
      capacity: Number(capacity),
      availableBeds: Number(capacity), // Initially all beds are free
      block: block.trim(),
    });

    // Update hostel room counter
    hostel.totalRooms = await Room.countDocuments({ hostelId: id });
    await hostel.save();

    return NextResponse.json({
      message: "Room added successfully!",
      room: newRoom,
    });
  } catch (error: any) {
    console.error("Add room error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
