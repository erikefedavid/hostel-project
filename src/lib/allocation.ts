import dbConnect from "./db";
import User from "@/models/User";
import Hostel from "@/models/Hostel";
import Room from "@/models/Room";
import Application from "@/models/Application";
import Semester from "@/models/Semester";
import { sendEmail } from "./email";

interface AllocationSummary {
  success: boolean;
  allocatedCount: number;
  notAllocatedCount: number;
  totalProcessed: number;
  message: string;
}

/**
 * Runs the rule-based Hostel Allocation Engine for a given semester.
 * 
 * Rules applied in order:
 * 1. Gender Match
 * 2. Room Availability (availableBeds > 0)
 * 3. Level Priority (500L -> 400L -> 300L -> 200L -> 100L)
 * 4. First-Come-First-Served (submittedAt ASC)
 * 5. Special Needs Priority (Allocated to floor 0 / ground floor rooms first)
 */
export async function runAllocationEngine(semesterLabel: string): Promise<AllocationSummary> {
  await dbConnect();

  console.log(`[ALLOCATION ENGINE] Starting auto-allocation for semester: ${semesterLabel}`);

  // 1. Fetch all PENDING applications for this semester
  const pendingApplications = await Application.find({
    semester: semesterLabel,
    status: "PENDING",
  }).populate("studentId");

  if (pendingApplications.length === 0) {
    return {
      success: true,
      allocatedCount: 0,
      notAllocatedCount: 0,
      totalProcessed: 0,
      message: "No pending applications found for this semester.",
    };
  }

  console.log(`[ALLOCATION ENGINE] Found ${pendingApplications.length} pending applications.`);

  // 2. Sort applications by priority rules:
  // - Rule 3: Level priority (Higher levels first)
  // - Rule 4: First-come-first-served (submittedAt ASC)
  const sortedApplications = [...pendingApplications].sort((a: any, b: any) => {
    const studentA = a.studentId;
    const studentB = b.studentId;

    if (!studentA || !studentB) return 0;

    const levelA = parseInt(studentA.level || "100", 10);
    const levelB = parseInt(studentB.level || "100", 10);

    if (levelA !== levelB) {
      return levelB - levelA; // Descending (500L first, then 400L, etc.)
    }

    // First-come-first-served
    const timeA = new Date(a.submittedAt).getTime();
    const timeB = new Date(b.submittedAt).getTime();
    return timeA - timeB; // Ascending (earlier first)
  });

  let allocatedCount = 0;
  let notAllocatedCount = 0;

  // 3. Process each application in order
  for (const app of sortedApplications) {
    const student = app.studentId as any;
    if (!student) {
      app.status = "NOT_ALLOCATED";
      await app.save();
      notAllocatedCount++;
      continue;
    }

    const { gender, specialNeeds, fullName, email } = student;

    // A. Find hostels matching student gender
    const matchingHostels = await Hostel.find({ gender });
    const hostelIds = matchingHostels.map((h) => h._id);

    if (hostelIds.length === 0) {
      app.status = "NOT_ALLOCATED";
      await app.save();
      notAllocatedCount++;
      console.log(`[ALLOCATION] No matching hostels for ${fullName} (${gender})`);
      continue;
    }

    // B. Find available rooms in these hostels
    const availableRooms = await Room.find({
      hostelId: { $in: hostelIds },
      availableBeds: { $gt: 0 },
    }).populate("hostelId");

    if (availableRooms.length === 0) {
      app.status = "NOT_ALLOCATED";
      await app.save();
      notAllocatedCount++;
      console.log(`[ALLOCATION] No available beds in matching hostels for ${fullName}`);

      // Send failure notification
      await sendEmail({
        to: email,
        subject: "HAMS: Hostel Allocation Update",
        text: `Dear ${fullName},\n\nWe regret to inform you that we could not allocate a room for you in the ${semesterLabel} semester due to room capacity constraints.\n\nBest regards,\nHostel Admin.`,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Hostel Allocation Update</h2>
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>We regret to inform you that we could not allocate a room for you in the <strong>${semesterLabel}</strong> semester due to room capacity constraints.</p>
                <p>Best regards,<br/>Hostel Management System (HAMS)</p>
              </div>`,
      });
      continue;
    }

    // C. Special Needs priority sorting:
    // If student has special needs, sort rooms to put ground floor (floor = 0) first.
    // Otherwise, default sorting.
    const sortedRooms = [...availableRooms].sort((a: any, b: any) => {
      if (specialNeeds) {
        if (a.floor === 0 && b.floor !== 0) return -1;
        if (a.floor !== 0 && b.floor === 0) return 1;
      }
      // Keep existing room order (could sort by hostel name/room number)
      return a.roomNumber.localeCompare(b.roomNumber);
    });

    // D. Assign the first matching room
    const targetRoom = sortedRooms[0];
    const targetHostel = targetRoom.hostelId as any;

    targetRoom.availableBeds -= 1;
    await targetRoom.save();

    app.status = "ALLOCATED";
    app.roomId = targetRoom._id as any;
    app.allocatedAt = new Date();
    await app.save();

    allocatedCount++;
    console.log(`[ALLOCATION SUCCESS] Assigned ${fullName} to ${targetHostel.name} - Block ${targetRoom.block} Room ${targetRoom.roomNumber}`);

    // Send success notification
    await sendEmail({
      to: email,
      subject: "HAMS: Hostel Allocation Successful! 🎉",
      text: `Dear ${fullName},\n\nCongratulations! You have been allocated accommodation for the ${semesterLabel} semester.\n\nHostel: ${targetHostel.name}\nBlock: ${targetRoom.block}\nRoom: ${targetRoom.roomNumber}\nFloor: ${targetRoom.floor === 0 ? "Ground Floor" : targetRoom.floor}\n\nBest regards,\nHostel Admin.`,
      html: `<div style="font-family: sans-serif; padding: 20px; border-left: 4px solid #db2777; background-color: #faf5ff;">
              <h2 style="color: #0b1e47;">Hostel Allocation Successful! 🎉</h2>
              <p>Dear <strong>${fullName}</strong>,</p>
              <p>Congratulations! You have been successfully allocated accommodation for the <strong>${semesterLabel}</strong> semester.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f1f5f9;"><td style="padding: 10px; font-weight: bold;">Hostel</td><td style="padding: 10px;">${targetHostel.name}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Block</td><td style="padding: 10px;">${targetRoom.block}</td></tr>
                <tr style="background-color: #f1f5f9;"><td style="padding: 10px; font-weight: bold;">Room Number</td><td style="padding: 10px;">${targetRoom.roomNumber}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Floor</td><td style="padding: 10px;">${targetRoom.floor === 0 ? "Ground Floor" : `Floor ${targetRoom.floor}`}</td></tr>
              </table>
              <p>Best regards,<br/>Hostel Management System (HAMS)</p>
            </div>`,
    });
  }

  return {
    success: true,
    allocatedCount,
    notAllocatedCount,
    totalProcessed: sortedApplications.length,
    message: `Allocation run complete. Processed ${sortedApplications.length} applications. Allocated: ${allocatedCount}, Not Allocated: ${notAllocatedCount}.`,
  };
}
