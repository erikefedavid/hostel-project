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


async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("No MONGODB_URI found");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const usersCollection = mongoose.connection.collection("users");
  
  // Check if superadmin already exists
  const existingAdmin = await usersCollection.findOne({ email: "admin@lcu.edu.ng" });
  
  if (existingAdmin) {
    console.log("Superadmin already exists! Email: admin@lcu.edu.ng, Password: password123");
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  await usersCollection.insertOne({
    fullName: "Super Admin",
    email: "admin@lcu.edu.ng",
    passwordHash,
    role: "superadmin",
    gender: "male",
    level: "500",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Superadmin created successfully!");
  console.log("Email: admin@lcu.edu.ng");
  console.log("Password: password123");
  
  process.exit(0);
}

seed().catch(console.error);
