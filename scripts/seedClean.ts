import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (_) {}

import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      process.env[match[1].trim()] = val;
    }
  });
}

import User from "../src/models/User";
import Hostel from "../src/models/Hostel";
import Room from "../src/models/Room";
import Semester from "../src/models/Semester";
import Application from "../src/models/Application";

async function seedClean() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected. Clearing existing database...");

    // 1. Wipe all collections cleanly
    await Hostel.deleteMany({});
    await Room.deleteMany({});
    await Semester.deleteMany({});
    await Application.deleteMany({});
    await User.deleteMany({});

    console.log("Database cleared.");

    // 2. Create Active Semester
    const semester = await Semester.create({
      label: "2026/2027 First Semester",
      isOpen: true,
      openedAt: new Date(),
    });
    console.log("Created Active Semester:", semester.label);

    // 3. Create Hostels and Rooms
    const hostelsToCreate = [
      { name: "Lemon", gender: "male" },
      { name: "Apple Hall", gender: "female" },
      { name: "Genesis", gender: "male" },
      { name: "Block U", gender: "male" },
      { name: "Block I", gender: "male" },
      { name: "Block L", gender: "female" },
      { name: "Block C", gender: "female" },
      { name: "Hibiscus", gender: "male" },
      { name: "Camp David 1", gender: "female" },
      { name: "Camp David 2", gender: "female" },
      { name: "Champions", gender: "male" },
      { name: "Exodus", gender: "male" },
      { name: "Olive", gender: "female" },
      { name: "Cedar (Male)", gender: "male" },
      { name: "Cedar (Female)", gender: "female" },
    ];

    const createdHostels: any[] = [];
    for (const h of hostelsToCreate) {
      const hostel = await Hostel.create({ name: h.name, gender: h.gender as "male" | "female", totalRooms: 10 });
      createdHostels.push(hostel);
    }

    const createRooms = async (hostelId: mongoose.Types.ObjectId, prefix: string) => {
      const roomsToInsert = [];
      for (const block of ["A", "B"]) {
        for (let floor = 0; floor < 1; floor++) {
          for (let r = 1; r <= 5; r++) {
            const roomNumber = `${prefix}${block}-${floor}0${r}`;
            roomsToInsert.push({
              hostelId,
              block,
              floor,
              roomNumber,
              capacity: 4,
              availableBeds: 4,
            });
          }
        }
      }
      return Room.insertMany(roomsToInsert);
    };

    let totalRoomsCount = 0;
    for (const hostel of createdHostels) {
      const cleanName = hostel.name.replace(/[^a-zA-Z]/g, "");
      const prefix = cleanName.substring(0, 3).toUpperCase() + "-";
      const rooms = await createRooms(hostel._id as mongoose.Types.ObjectId, prefix);
      totalRoomsCount += rooms.length;
    }
    console.log(`Created ${createdHostels.length} hostels with ${totalRoomsCount} rooms available.`);

    // 4. Create Core Dummy Accounts
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Super Admin
    await User.create({
      fullName: "Super Admin",
      email: "admin@lcu.edu.ng",
      passwordHash: hashedPassword,
      role: "superadmin",
      gender: "male",
      level: "500",
    });

    // Admin (Chief Warden)
    await User.create({
      fullName: "Chief Warden",
      email: "warden@lcu.edu.ng",
      passwordHash: hashedPassword,
      role: "admin",
      gender: "male",
      level: "500",
    });

    // Demo Student
    await User.create({
      fullName: "Demo Student",
      email: "student@lcu.edu.ng",
      passwordHash: hashedPassword,
      matricNumber: "LCU/UG/24/0001",
      role: "student",
      gender: "male",
      level: "400",
    });

    console.log("\n✅ Clean seed completed successfully!");
    console.log("-----------------------------------------");
    console.log("Super Admin: admin@lcu.edu.ng  / password123");
    console.log("Admin:       warden@lcu.edu.ng / password123");
    console.log("Student:     student@lcu.edu.ng / password123");
    console.log("-----------------------------------------");
    console.log("Database is clean and ready for real student signups!");

    process.exit(0);
  } catch (err) {
    console.error("Clean seed error:", err);
    process.exit(1);
  }
}

seedClean();
