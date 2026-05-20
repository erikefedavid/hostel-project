import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const { roomNumber, floor, capacity, block, availableBeds } = await req.json();

    await dbConnect();

    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (roomNumber) room.roomNumber = roomNumber.trim();
    if (floor !== undefined) room.floor = Number(floor);
    if (capacity !== undefined) {
      // If capacity is reduced, adjust available beds
      const diff = Number(capacity) - room.capacity;
      room.capacity = Number(capacity);
      room.availableBeds = Math.max(0, room.availableBeds + diff);
    }
    if (availableBeds !== undefined) {
      room.availableBeds = Math.min(room.capacity, Math.max(0, Number(availableBeds)));
    }
    if (block) room.block = block.trim();

    await room.save();

    return NextResponse.json({
      message: "Room details updated successfully!",
      room,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Only superadmins can delete rooms" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if any beds are occupied
    if (room.availableBeds < room.capacity) {
      return NextResponse.json(
        { error: "Cannot delete a room that has active student allocations. Revoke allocations first." },
        { status: 400 }
      );
    }

    const hostelId = room.hostelId;
    await Room.findByIdAndDelete(id);

    // Update hostel room counter
    const hostel = await Hostel.findById(hostelId);
    if (hostel) {
      hostel.totalRooms = await Room.countDocuments({ hostelId });
      await hostel.save();
    }

    return NextResponse.json({
      message: "Room deleted successfully!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
