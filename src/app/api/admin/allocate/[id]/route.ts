import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";

// Ensure mongoose registrations
const _Room = Room;
const _Hostel = Hostel;
const _User = User;

// PUT: Manual Override: Assign a student to a specific room
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params; // application id
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required for manual assignment" }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch application
    const app = await Application.findById(id).populate("studentId");
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const student = app.studentId as any;
    if (!student) {
      return NextResponse.json({ error: "Student associated with this application not found" }, { status: 404 });
    }

    // 2. Fetch new room
    const newRoom = await Room.findById(roomId).populate("hostelId");
    if (!newRoom) {
      return NextResponse.json({ error: "Target room not found" }, { status: 404 });
    }

    const targetHostel = newRoom.hostelId as any;

    // Verify gender matches hostel gender
    if (student.gender !== targetHostel.gender) {
      return NextResponse.json(
        { error: `Gender mismatch. Student is ${student.gender} but hostel is designated for ${targetHostel.gender}.` },
        { status: 400 }
      );
    }

    // If changing room, release the old bed first
    if (app.roomId && app.roomId.toString() !== roomId) {
      const oldRoom = await Room.findById(app.roomId);
      if (oldRoom) {
        oldRoom.availableBeds = Math.min(oldRoom.capacity, oldRoom.availableBeds + 1);
        await oldRoom.save();
      }
    }

    // Check if new room has beds
    if (newRoom.availableBeds <= 0 && (!app.roomId || app.roomId.toString() !== roomId)) {
      return NextResponse.json({ error: "No available beds in the selected room." }, { status: 400 });
    }

    // Decrement new room beds if student wasn't already in this room
    if (!app.roomId || app.roomId.toString() !== roomId) {
      newRoom.availableBeds = Math.max(0, newRoom.availableBeds - 1);
      await newRoom.save();
    }

    // Update application
    app.status = "ALLOCATED";
    app.roomId = newRoom._id as any;
    app.allocatedAt = new Date();
    await app.save();

    console.log(`[MANUAL OVERRIDE] Admin assigned ${student.fullName} to ${targetHostel.name} Room ${newRoom.roomNumber}`);

    // Send update email
    await sendEmail({
      to: student.email,
      subject: "HAMS: Hostel Allocation Update (Manual Assignment)",
      text: `Dear ${student.fullName},\n\nYour hostel accommodation has been updated by the administrator.\n\nHostel: ${targetHostel.name}\nBlock: ${newRoom.block}\nRoom: ${newRoom.roomNumber}\nFloor: ${newRoom.floor === 0 ? "Ground Floor" : newRoom.floor}\n\nBest regards,\nHostel Admin.`,
      html: `<div style="font-family: sans-serif; padding: 20px; border-left: 4px solid #3b82f6; background-color: #f0f9ff;">
              <h2 style="color: #0b1e47;">Hostel Allocation Updated</h2>
              <p>Dear <strong>${student.fullName}</strong>,</p>
              <p>Your hostel accommodation has been updated by the administrator for the <strong>${app.semester}</strong> semester.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f1f5f9;"><td style="padding: 10px; font-weight: bold;">Hostel</td><td style="padding: 10px;">${targetHostel.name}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Block</td><td style="padding: 10px;">${newRoom.block}</td></tr>
                <tr style="background-color: #f1f5f9;"><td style="padding: 10px; font-weight: bold;">Room Number</td><td style="padding: 10px;">${newRoom.roomNumber}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Floor</td><td style="padding: 10px;">${newRoom.floor === 0 ? "Ground Floor" : `Floor ${newRoom.floor}`}</td></tr>
              </table>
              <p>Best regards,<br/>Hostel Management System (HAMS)</p>
            </div>`,
    });

    return NextResponse.json({
      message: "Allocation manually updated successfully!",
      application: app,
    });
  } catch (error: any) {
    console.error("Manual override error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

// DELETE: Revoke a student's allocation
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params; // application id
    await dbConnect();

    const app = await Application.findById(id).populate("studentId");
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const student = app.studentId as any;

    // Release bed if room is assigned
    if (app.roomId) {
      const room = await Room.findById(app.roomId);
      if (room) {
        room.availableBeds = Math.min(room.capacity, room.availableBeds + 1);
        await room.save();
      }
    }

    app.status = "NOT_ALLOCATED";
    app.roomId = null;
    app.allocatedAt = null;
    await app.save();

    if (student) {
      console.log(`[REVOKE ALLOCATION] Admin revoked allocation for ${student.fullName}`);

      // Send revoke email
      await sendEmail({
        to: student.email,
        subject: "HAMS: Hostel Allocation Revoked",
        text: `Dear ${student.fullName},\n\nWe write to inform you that your hostel allocation for the ${app.semester} semester has been revoked by the administrator.\n\nPlease contact the hostel admin office for clarification.\n\nBest regards,\nHostel Admin.`,
        html: `<div style="font-family: sans-serif; padding: 20px; border-left: 4px solid #ef4444; background-color: #fef2f2;">
                <h2 style="color: #ef4444;">Hostel Allocation Revoked</h2>
                <p>Dear <strong>${student?.fullName || "Student"}</strong>,</p>
                <p>We write to inform you that your hostel allocation for the <strong>${app.semester}</strong> semester has been revoked by the administrator.</p>
                <p>Please contact the hostel administrator office for further clarification.</p>
                <p>Best regards,<br/>Hostel Management System (HAMS)</p>
              </div>`,
      });
    }

    return NextResponse.json({
      message: "Allocation successfully revoked!",
      application: app,
    });
  } catch (error: any) {
    console.error("Revoke error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
