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

    const report = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id });
        const totalRooms = rooms.length;
        const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
        const availableBeds = rooms.reduce((sum, r) => sum + r.availableBeds, 0);
        const occupiedBeds = totalCapacity - availableBeds;
        const occupancyRate = totalCapacity > 0 ? (occupiedBeds / totalCapacity) * 100 : 0;

        return {
          hostelId: hostel._id.toString(),
          name: hostel.name,
          gender: hostel.gender,
          totalRooms,
          totalCapacity,
          occupiedBeds,
          availableBeds,
          occupancyRate: Math.round(occupancyRate * 10) / 10, // 1 decimal place
        };
      })
    );

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
