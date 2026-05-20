"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Building2, Calendar, FileText, CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [application, setApplication] = useState<any>(null);
  const [semester, setSemester] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplicationStatus = async () => {
    try {
      const res = await fetch("/api/student/application");
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
        setSemester(data.semester);
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  // Check if student profile is complete
  const isProfileIncomplete =
    !session?.user ||
    !(session.user as any).gender ||
    !(session.user as any).level ||
    !(session.user as any).id;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Hello, <span className="text-gradient">{session?.user.name}</span>
          </h1>
          <p className="text-slate-600 text-sm">
            Manage your LCU hostel accommodation requests and view allocation details.
          </p>
        </div>
        <div className="text-xs bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 mt-2 md:mt-0 w-fit">
          Matric: <span className="font-bold text-slate-900">{(session?.user as any).email.split("@")[0].toUpperCase()}</span>
        </div>
      </div>

      {/* Incomplete Profile Warning */}
      {isProfileIncomplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800">Profile Information Incomplete</h4>
              <p className="text-sm text-amber-700/90 leading-relaxed">
                You must update your profile (Matric Number, Gender, and level) in settings before submitting hostel applications.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/student/profile")}
            className="w-fit text-amber-800 border-amber-500/30 hover:bg-amber-500/10"
          >
            Update Profile
          </Button>
        </motion.div>
      )}

      {/* Active Application Status Grid */}
      <div className="grid gap-6">
        {application ? (
          /* Application status detail card */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Card
              glow={application.status === "ALLOCATED" ? "blue" : "pink"}
              className="p-6 md:p-8 border-slate-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50/5 border border-slate-300 rounded-xl text-slate-700">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Semester Accommodation</h3>
                    <p className="text-sm text-slate-600">Semester: {application.semester}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mr-1">
                    Application Status
                  </span>
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
              </div>

              {/* Status Specific Renderings */}
              <div className="pt-6">
                {application.status === "PENDING" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700 animate-pulse-slow">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-lg mb-1">Under Administrative Review</h4>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                        Your application was received on{" "}
                        <span className="text-slate-900 font-semibold">
                          {formatDate(application.submittedAt)}
                        </span>
                        . The automated allocation engine runs periodically. You will be notified via email
                        as soon as the results are generated.
                      </p>
                    </div>
                  </div>
                )}

                {application.status === "ALLOCATED" && application.roomId && (
                  <div className="flex flex-col gap-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-700">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-800 text-lg">Allocation Confirmed! 🎉</h4>
                        <p className="text-sm text-slate-600">Room coordinates are registered under your profile.</p>
                      </div>
                    </div>

                    {/* Room Specs */}
                    <div className="grid sm:grid-cols-4 gap-4 mt-2">
                      <div className="p-4 rounded-xl bg-slate-50/5 border border-slate-200 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hostel</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {application.roomId.hostelId?.name || "Moremi Hall"}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50/5 border border-slate-200 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Block</span>
                        <span className="text-base font-extrabold text-slate-900">
                          Block {application.roomId.block}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50/5 border border-slate-200 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Room Number</span>
                        <span className="text-base font-extrabold text-lcu-pink">
                          Room {application.roomId.roomNumber}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50/5 border border-slate-200 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Floor</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {application.roomId.floor === 0 ? "Ground Floor" : `Floor ${application.roomId.floor}`}
                        </span>
                      </div>
                    </div>

                    {application.notes && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Remarks
                        </h5>
                        <p className="text-sm text-slate-700 italic">“ {application.notes} ”</p>
                      </div>
                    )}
                  </div>
                )}

                {application.status === "NOT_ALLOCATED" && (
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-900 text-lg mb-1">Accommodation Not Allocated</h4>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                        Unfortunately, we were unable to allocate a hostel room for you in this semester.
                        This is usually due to total capacity limits. Please visit the Hostel Administrator
                        office for manual override options or waiting lists.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Call to Action: Student has not applied */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Card glow="pink" className="p-8 border-slate-300 text-center flex flex-col items-center gap-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-lcu-pink/10 border border-lcu-pink/20 flex items-center justify-center text-lcu-pink">
                <Building2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Application</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  You have not submitted a hostel application for the current semester. Run through our automated allocation portal to secure a room instantly.
                </p>
              </div>

              {semester ? (
                semester.isOpen ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="text-xs bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
                      Window is Open for: <span className="font-bold text-slate-900">{semester.label}</span>
                    </div>
                    <Button
                      variant="pink"
                      disabled={isProfileIncomplete}
                      onClick={() => router.push("/student/apply")}
                      className="w-full py-3.5 flex items-center justify-center gap-2"
                    >
                      <span>Submit Application Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-semibold">
                    Applications are currently CLOSED for {semester.label}.
                  </div>
                )
              ) : (
                <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold">
                  No active semester window has been opened by administrators yet.
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
export const runtime = "nodejs";
