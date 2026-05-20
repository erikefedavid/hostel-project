import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, matricNumber, gender, level, specialNeeds, role } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required fields." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    // If matric number is provided, check if it's unique
    if (matricNumber) {
      const existingUserByMatric = await User.findOne({ matricNumber });
      if (existingUserByMatric) {
        return NextResponse.json(
          { error: "A student with this matric number already exists." },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // If there are no users in the DB, make the first user a superadmin
    const userCount = await User.countDocuments();
    let assignedRole = role || "student";
    if (userCount === 0) {
      assignedRole = "superadmin";
    }

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      matricNumber: matricNumber || undefined,
      gender: gender || undefined,
      level: level || undefined,
      specialNeeds: !!specialNeeds,
      role: assignedRole,
    });

    return NextResponse.json(
      {
        message: "Registration successful!",
        user: {
          id: newUser._id.toString(),
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
