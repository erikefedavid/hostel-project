"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, FileText, CheckCircle2, AlertTriangle, ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function StudentProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [gender, setGender] = useState("male");
  const [level, setLevel] = useState("100");
  const [specialNeeds, setSpecialNeeds] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/student/profile");
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        if (user) {
          setFullName(user.fullName || "");
          setMatricNumber(user.matricNumber || "");
          setGender(user.gender || "male");
          setLevel(user.level || "100");
          setSpecialNeeds(!!user.specialNeeds);
        }
      }
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !matricNumber) {
      setError("Name and Matric number are required.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          gender,
          level,
          specialNeeds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile.");
      } else {
        setSuccess("Profile updated successfully!");
        
        // Update credentials local session if function is supported
        if (session) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              name: fullName,
              gender,
              level,
            },
          });
        }

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err: any) {
      setError("An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <button
        onClick={() => router.push("/student/dashboard")}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider transition-colors mr-auto cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Academic <span className="text-gradient">Profile</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure your student registration and special needs attributes.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-sm text-red-600"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card glow="pink" className="p-6 md:p-8 border-slate-300">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="relative">
              <Input
                label="Full Name"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-11"
              />
              <User className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            <div className="relative">
              <Input
                label="Matric Number (Read-only after setup)"
                type="text"
                placeholder="LCU/UG/22/24669"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                disabled={!!matricNumber} // Disable to protect matric integrity once registered
                required
                className="pl-11 disabled:opacity-50"
              />
              <FileText className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="glass-input px-4 py-3 rounded-xl text-base bg-white/85"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">Academic Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="glass-input px-4 py-3 rounded-xl text-base bg-white/85"
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/5 border border-slate-200 select-none">
              <input
                id="specialNeedsCheck"
                type="checkbox"
                checked={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.checked)}
                className="w-5 h-5 rounded-lg border-slate-300 text-lcu-pink bg-slate-50/5 focus:ring-lcu-pink cursor-pointer"
              />
              <div>
                <label htmlFor="specialNeedsCheck" className="text-xs font-bold text-slate-800 cursor-pointer block">
                  I have Special Needs
                </label>
                <span className="text-[10px] text-slate-600 block mt-0.5">
                  Prioritizes ground floor (Floor 0) rooms during allocation loops.
                </span>
              </div>
            </div>

            <Button
              variant="pink"
              type="submit"
              isLoading={isSaving}
              className="py-3.5 mt-2"
            >
              Save Profile Settings
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
export const runtime = "nodejs";
