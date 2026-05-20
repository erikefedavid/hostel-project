import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Hostel from "@/models/Hostel";
import Room from "@/models/Room";

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

    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    const rooms = await Room.find({ hostelId: hostel._id });
    const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const availableBeds = rooms.reduce((sum, r) => sum + r.availableBeds, 0);

    return NextResponse.json({
      hostel: {
        ...hostel.toObject(),
        totalRooms: rooms.length,
        totalBeds,
        availableBeds,
        occupiedBeds: totalBeds - availableBeds,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

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
    const { name, gender } = await req.json();

    await dbConnect();
    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    if (name) hostel.name = name.trim();
    if (gender) hostel.gender = gender;

    await hostel.save();

    return NextResponse.json({
      message: "Hostel details updated successfully!",
      hostel,
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
      return NextResponse.json({ error: "Only superadmins can delete hostels" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    // Check if hostel has rooms
    const roomCount = await Room.countDocuments({ hostelId: id });
    if (roomCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete a hostel that has rooms. Please delete rooms first." },
        { status: 400 }
      );
    }

    await Hostel.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Hostel deleted successfully!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
