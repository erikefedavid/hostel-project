"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Calendar, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ApplyPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [activeSemester, setActiveSemester] = useState<any>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [notes, setNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkEligibilityAndSemester = async () => {
    try {
      const res = await fetch("/api/student/application");
      if (res.ok) {
        const data = await res.json();
        setActiveSemester(data.semester);
        if (data.application) {
          setAlreadyApplied(true);
        }
      }
    } catch (err) {
      console.error("Eligibility check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkEligibilityAndSemester();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSemester?.isOpen) {
      setError("Hostel applications are currently closed.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/student/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit application.");
      } else {
        setSuccess("Application submitted successfully! Tracking status now...");
        setTimeout(() => {
          router.push("/student/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
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

  // Profile check
  const isProfileIncomplete =
    !session?.user ||
    !(session.user as any).gender ||
    !(session.user as any).level ||
    !(session.user as any).id;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Top Breadcrumb */}
      <button
        onClick={() => router.push("/student/dashboard")}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider transition-colors mr-auto cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hostel <span className="text-gradient">Application</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Apply for hostel room accommodation in Lead City University.
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

      {alreadyApplied ? (
        <Card className="p-8 border-slate-300 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">Already Submitted</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mt-1">
              You have already submitted a hostel application for the current semester. You can track your assignment status on the dashboard.
            </p>
          </div>
          <Button variant="outline" className="mt-2" onClick={() => router.push("/student/dashboard")}>
            View Status Dashboard
          </Button>
        </Card>
      ) : isProfileIncomplete ? (
        <Card className="p-8 border-slate-300 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">Profile Details Required</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mt-1">
              Your academic profile details are incomplete. You must configure your Gender, Matric Number, and Academic Level before submitting a hostel accommodation application.
            </p>
          </div>
          <Button variant="pink" className="mt-2" onClick={() => router.push("/student/profile")}>
            Complete Profile Now
          </Button>
        </Card>
      ) : activeSemester && activeSemester.isOpen ? (
        /* The Actual Application Form */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glow="pink" className="p-6 md:p-8 border-slate-300">
            <form onSubmit={handleApply} className="flex flex-col gap-6">
              {/* Semester info banner */}
              <div className="p-4 rounded-xl bg-slate-50/5 border border-slate-200 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-lcu-pink flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Target Academic Period
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeSemester.label} Semester
                  </span>
                </div>
              </div>

              {/* Remarks/Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Additional Notes / Remarks (Optional)
                </label>
                <textarea
                  placeholder="Mention any special accommodations, room preference remarks, or health conditions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-base min-h-[120px] placeholder-slate-500 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Priority Notice Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900 uppercase block mb-1">Priority Rule Reminder:</span>
                Your application will be sorted based on level priority and application time (first-come-first-served). Ground floor priorities are reserved for special needs profiles.
              </div>

              <Button
                variant="pink"
                type="submit"
                isLoading={isSubmitting}
                className="py-3.5 flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Application Form</span>
              </Button>
            </form>
          </Card>
        </motion.div>
      ) : (
        <Card className="p-8 border-slate-300 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">Applications Closed</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mt-1">
              Hostel application windows are currently closed. Please contact administrators or monitor your dashboard for semester schedule updates.
            </p>
          </div>
          <Button variant="outline" className="mt-2" onClick={() => router.push("/student/dashboard")}>
            Return to Dashboard
          </Button>
        </Card>
      )}
    </div>
  );
}
export const runtime = "nodejs";
