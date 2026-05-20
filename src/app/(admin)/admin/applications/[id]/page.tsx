"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Calendar,
  Home,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  XCircle,
  Award,
  Sparkles
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function ApplicationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { id: appId } = React.use(params);

  // Core Data States
  const [application, setApplication] = useState<any>(null);
  const [matchingRooms, setMatchingRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchApplicationDetails = async () => {
    try {
      // 1. Fetch Application details
      const appRes = await fetch(`/api/admin/applications/${appId}`);
      if (!appRes.ok) {
        setError("Failed to fetch application details.");
        setIsLoading(false);
        return;
      }
      const appData = await appRes.json();
      const app = appData.application;
      setApplication(app);

      if (app && app.studentId) {
        const studentGender = app.studentId.gender;

        // 2. Fetch all hostels of matching gender to get eligible rooms
        const hostelsRes = await fetch("/api/admin/hostels");
        if (hostelsRes.ok) {
          const hData = await hostelsRes.json();
          const targetHostels = (hData.hostels || []).filter(
            (h: any) => h.gender === studentGender
          );

          // Get all rooms inside these hostels
          const allMatchingRooms: any[] = [];
          await Promise.all(
            targetHostels.map(async (hostel: any) => {
              const roomsRes = await fetch(`/api/admin/hostels/${hostel._id}/rooms`);
              if (roomsRes.ok) {
                const rData = await roomsRes.json();
                const eligibleRooms = (rData.rooms || []).filter(
                  (room: any) => room.availableBeds > 0 || (app.roomId && app.roomId._id === room._id)
                );
                eligibleRooms.forEach((r: any) => {
                  allMatchingRooms.push({
                    ...r,
                    hostelName: hostel.name,
                  });
                });
              }
            })
          );

          setMatchingRooms(allMatchingRooms);
        }
      }
    } catch (err) {
      console.error("Error loading application details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [appId]);

  const handleManualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError("Please select a target room to assign.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/allocate/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: selectedRoomId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update room allocation.");
      } else {
        setSuccess("Manual allocation confirmed and updated!");
        fetchApplicationDetails();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm("Are you sure you want to revoke this student's allocation? The assigned bed will be released.")) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/allocate/${appId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to revoke allocation.");
      } else {
        setSuccess("Allocation successfully revoked!");
        setSelectedRoomId("");
        fetchApplicationDetails();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("An error occurred during revocation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-red-600" />
        <p className="text-slate-600 text-sm">Application record not found.</p>
        <Button variant="outline" onClick={() => router.push("/admin/applications")}>
          Return to List
        </Button>
      </div>
    );
  }

  const student = application.studentId || {};

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Top back navigation */}
      <button
        onClick={() => router.push("/admin/applications")}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider transition-colors mr-auto cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Application <span className="text-gradient">Review</span>
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Inspect student credentials and perform manual overrides or revoke assignments.
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

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Student Details Card */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <Card glow="pink" className="p-5 border-slate-200 flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-lcu-pink/10 border border-lcu-pink/20 flex items-center justify-center font-black text-2xl text-lcu-pink shadow-md">
                {student.fullName ? student.fullName.charAt(0) : "S"}
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg tracking-wide mt-2">
                {student.fullName}
              </h3>
              <span className="text-xs text-slate-500 font-mono">{student.matricNumber}</span>
            </div>

            {/* Student coordinates lists */}
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold uppercase">Academic Level</span>
                <span className="font-bold text-slate-900">{student.level} Level</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-white/2">
                <span className="text-slate-500 font-semibold uppercase">Gender</span>
                <span className="font-bold text-slate-900 uppercase">{student.gender}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-white/2">
                <span className="text-slate-500 font-semibold uppercase">Needs</span>
                <span className="font-bold text-slate-900">
                  {student.specialNeeds ? "Yes (Priority)" : "None"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-white/2">
                <span className="text-slate-500 font-semibold uppercase">Applied Date</span>
                <span className="font-bold text-slate-600">
                  {formatDate(application.submittedAt)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Application Status and Overrides */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Active status banner */}
          <Card glow="blue" className="p-6 border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-lcu-pink" />
                <span className="text-sm font-bold text-slate-900">Semester Period: {application.semester}</span>
              </div>

              <Badge
                variant={
                  application.status === "ALLOCATED"
                    ? "allocated"
                    : application.status === "NOT_ALLOCATED"
                    ? "not_allocated"
                    : "pending"
                }
                className="text-xs"
              >
                {application.status}
              </Badge>
            </div>

            {/* Current Room Coordinates */}
            {application.status === "ALLOCATED" && application.roomId ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Student is allocated to a room!</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50/5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Hostel</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {application.roomId.hostelId?.name || "HAMS Hostel"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50/5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Room Number</span>
                    <span className="text-sm font-extrabold text-lcu-pink">
                      Room {application.roomId.roomNumber}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50/5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Block/Floor</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {application.roomId.block} - F{application.roomId.floor}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-2">
                  <button
                    onClick={handleRevoke}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl border border-red-500/20 text-red-600 hover:text-slate-900 hover:bg-red-600/10 hover:border-red-500/40 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Revoke Accommodation Assignment</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm leading-relaxed flex gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-lcu-pink flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 uppercase block mb-0.5">Not Allocated:</span>
                    The student has no room coordinates assigned for this semester. You can select a target room below to manually override the allocation loop.
                  </div>
                </div>

                {/* Remarks/Notes by Student */}
                {application.notes && (
                  <div className="p-3.5 rounded-xl bg-white/2 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                      Student Remarks / Notes
                    </span>
                    <p className="text-xs text-slate-700 italic">“ {application.notes} ”</p>
                  </div>
                )}

                {/* Manual Override Assignment Form */}
                <form onSubmit={handleManualAssign} className="flex flex-col gap-4 border-t border-slate-200 pt-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      Eligible Rooms ({student.gender} designation)
                    </label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="glass-input px-4 py-3 rounded-xl text-sm bg-white/85 focus:outline-none"
                    >
                      <option value="">Select Room coordinates...</option>
                      {matchingRooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.hostelName} · Block {room.block} · Room {room.roomNumber} ({room.availableBeds} beds available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="pink"
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!selectedRoomId}
                    className="w-full py-3.5 flex items-center justify-center gap-2 mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Manual Assignment</span>
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
export const runtime = "nodejs";
