import mongoose from "mongoose";
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

// Schemas need to be imported or defined so Mongoose knows them
import User from "../src/models/User";
import Hostel from "../src/models/Hostel";
import Room from "../src/models/Room";
import Semester from "../src/models/Semester";
import Application from "../src/models/Application";

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected. Purging existing data...");

    // 1. Wipe data
    await Hostel.deleteMany({});
    await Room.deleteMany({});
    await Semester.deleteMany({});
    await Application.deleteMany({});
    await User.deleteMany({ role: { $ne: "superadmin" } });

    console.log("Data purged.");

    // 2. Create Semester
    const semester = await Semester.create({
      label: "2026/2027 First Semester",
      isOpen: true,
      openedAt: new Date(),
    });
    console.log("Semester created:", semester.label);

    // 3. Create Hostels and Rooms
    const exoduxHostel = await Hostel.create({ name: "Exodux", gender: "male", totalRooms: 20 });
    const oliveHostel = await Hostel.create({ name: "Olive", gender: "female", totalRooms: 20 });
    const enterpriseMaleHostel = await Hostel.create({ name: "Enterprise (Male)", gender: "male", totalRooms: 20 });
    const enterpriseFemaleHostel = await Hostel.create({ name: "Enterprise (Female)", gender: "female", totalRooms: 20 });

    const createRooms = async (hostelId: mongoose.Types.ObjectId, prefix: string) => {
      const roomsToInsert = [];
      for (const block of ["A", "B"]) {
        for (let floor = 0; floor < 2; floor++) {
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

    const exoduxRooms = await createRooms(exoduxHostel._id as mongoose.Types.ObjectId, "EX-");
    const oliveRooms = await createRooms(oliveHostel._id as mongoose.Types.ObjectId, "OL-");
    const enterpriseMaleRooms = await createRooms(enterpriseMaleHostel._id as mongoose.Types.ObjectId, "ENM-");
    const enterpriseFemaleRooms = await createRooms(enterpriseFemaleHostel._id as mongoose.Types.ObjectId, "ENF-");
    console.log(`Created ${exoduxRooms.length + oliveRooms.length + enterpriseMaleRooms.length + enterpriseFemaleRooms.length} rooms.`);

    // 4. Create Admin and Student Users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    await User.create({
      fullName: "Chief Warden",
      email: "warden@lcu.edu.ng",
      passwordHash: hashedPassword,
      role: "admin",
    });

    const maleNames = ["James", "John", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth"];
    const femaleNames = ["Mary", "Patricia", "Linda", "Barbara", "Elizabeth", "Jennifer", "Maria", "Susan", "Margaret", "Dorothy", "Lisa", "Nancy", "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol", "Ruth", "Sharon"];
    const surnames = ["Okafor", "Adeyemi", "Eze", "Ogunleye", "Obi", "Adebayo", "Nnamdi", "Bakare", "Okonkwo", "Mustapha"];

    const students = [];

    // 20 male students
    for (let i = 0; i < 20; i++) {
      const fname = maleNames[i];
      const lname = surnames[i % surnames.length];
      students.push({
        fullName: `${fname} ${lname}`,
        email: `lcu${1000 + i}@student.lcu.edu.ng`,
        passwordHash: hashedPassword,
        role: "student",
        gender: "male",
        level: `${(i % 4 + 1)}00`,
      });
    }

    // 20 female students
    for (let i = 0; i < 20; i++) {
      const fname = femaleNames[i];
      const lname = surnames[i % surnames.length];
      students.push({
        fullName: `${fname} ${lname}`,
        email: `lcu${2000 + i}@student.lcu.edu.ng`,
        passwordHash: hashedPassword,
        role: "student",
        gender: "female",
        level: `${(i % 4 + 1)}00`,
      });
    }

    const insertedStudents = await User.insertMany(students);
    console.log(`Created ${insertedStudents.length} students (20 male, 20 female)`);

    // 5. Create Applications
    const appsToInsert = [];
    const maleStudents = insertedStudents.filter(s => s.gender === "male");
    const femaleStudents = insertedStudents.filter(s => s.gender === "female");

    // 10 allocated (5 male, 5 female)
    for (let i = 0; i < 5; i++) {
      // Allocate Male
      const mRoom = exoduxRooms[i];
      appsToInsert.push({
        studentId: maleStudents[i]._id,
        semester: semester.label,
        status: "ALLOCATED",
        roomId: mRoom._id,
        allocatedAt: new Date(),
        notes: "Auto-allocated by dummy script",
      });
      await Room.findByIdAndUpdate(mRoom._id, { $inc: { availableBeds: -1 } });

      // Allocate Female
      const fRoom = oliveRooms[i];
      appsToInsert.push({
        studentId: femaleStudents[i]._id,
        semester: semester.label,
        status: "ALLOCATED",
        roomId: fRoom._id,
        allocatedAt: new Date(),
        notes: "Auto-allocated by dummy script",
      });
      await Room.findByIdAndUpdate(fRoom._id, { $inc: { availableBeds: -1 } });
    }

    // 10 pending (5 male, 5 female)
    for (let i = 5; i < 10; i++) {
      appsToInsert.push({
        studentId: maleStudents[i]._id,
        semester: semester.label,
        status: "PENDING",
      });
      appsToInsert.push({
        studentId: femaleStudents[i]._id,
        semester: semester.label,
        status: "PENDING",
      });
    }
    
    // The rest (10 male, 10 female) have no application yet (Simulates new logins)
    await Application.insertMany(appsToInsert);
    console.log(`Created ${appsToInsert.length} applications (10 Allocated, 10 Pending).`);

    console.log("✅ Seed completed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
