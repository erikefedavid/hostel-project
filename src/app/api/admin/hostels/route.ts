import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Hostel from "@/models/Hostel";
import Room from "@/models/Room";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const hostels = await Hostel.find().sort({ name: 1 });

    // Calculate room counts dynamically for each hostel to make sure UI stats are accurate!
    const enrichedHostels = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id });
        const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
        const availableBeds = rooms.reduce((sum, r) => sum + r.availableBeds, 0);
        const occupiedBeds = totalBeds - availableBeds;
        
        return {
          ...hostel.toObject(),
          totalRooms: rooms.length,
          totalBeds,
          availableBeds,
          occupiedBeds,
          occupancyPercentage: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        };
      })
    );

    return NextResponse.json({ hostels: enrichedHostels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { name, gender } = await req.json();

    if (!name || !gender) {
      return NextResponse.json({ error: "Name and gender are required" }, { status: 400 });
    }

    await dbConnect();

    // Check if name already exists
    const existingHostel = await Hostel.findOne({ name: name.trim() });
    if (existingHostel) {
      return NextResponse.json({ error: "Hostel with this name already exists" }, { status: 400 });
    }

    const newHostel = await Hostel.create({
      name: name.trim(),
      gender,
      totalRooms: 0,
    });

    return NextResponse.json({
      message: "Hostel created successfully!",
      hostel: newHostel,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
