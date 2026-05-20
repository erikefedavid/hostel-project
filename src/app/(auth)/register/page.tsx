"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Building, User, Mail, Lock, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  
  // Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [gender, setGender] = useState("male");
  const [level, setLevel] = useState("100");
  const [specialNeeds, setSpecialNeeds] = useState(false);
  
  // UX states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        fullName,
        email,
        password,
        matricNumber,
        gender,
        level,
        specialNeeds,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register account.");
      } else {
        setSuccess("Account registered! Logging in...");
        
        // Automatically sign in
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signInRes?.error) {
          router.refresh();
          router.push("/");
        } else {
          // If login fails for some reason, redirect to login page
          router.push("/login");
        }
      }
    } catch (err: any) {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-screen py-12 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card glow="pink" className="p-8 backdrop-blur-xl border-slate-300 relative">
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <div
              onClick={() => router.push("/")}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lcu-blue-light to-lcu-pink flex items-center justify-center shadow-lg shadow-pink-500/10 cursor-pointer mb-2"
            >
              <Building className="w-7 h-7 text-slate-900" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-wide">Create HAMS Account</h2>
            <p className="text-sm text-slate-600">Join Lead City University Hostel Portal</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-600"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-600"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <Input
                label="Full Name *"
                type="text"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-11"
              />
              <User className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            <div className="relative">
              <Input
                label="Email Address *"
                type="email"
                placeholder="john.doe@lcu.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11"
              />
              <Mail className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            <div className="relative">
              <Input
                label="Password *"
                type="password"
                placeholder="Create secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11"
              />
              <Lock className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            {/* Student Specific Fields */}
            <div className="flex flex-col gap-5 border-t border-slate-200 pt-5 mt-2">
              <div className="relative">
                <Input
                  label="Matric Number *"
                  type="text"
                  placeholder="LCU/UG/22/24669"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  required
                  className="pl-11"
                />
                <FileText className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="glass-input px-4 py-3 rounded-xl text-base bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Academic Level *</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="glass-input px-4 py-3 rounded-xl text-base bg-white"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 select-none mt-1">
                <input
                  id="specialNeeds"
                  type="checkbox"
                  checked={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-lcu-pink bg-white focus:ring-lcu-pink cursor-pointer"
                />
                <label htmlFor="specialNeeds" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  I have Special Needs (Prioritize Ground Floor Rooms)
                </label>
              </div>
            </div>

            <Button variant="pink" type="submit" isLoading={isLoading} className="w-full py-3.5 mt-2">
              Register Account
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-lcu-pink hover:text-lcu-pink-light font-bold hover:underline cursor-pointer"
            >
              Sign In Here
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
export const runtime = "nodejs";
