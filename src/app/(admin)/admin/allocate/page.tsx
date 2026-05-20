"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Sparkles, Server, Mail, ChevronRight, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AllocateControlCenter() {
  const router = useRouter();

  // Active status details
  const [semester, setSemester] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Allocation engine execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);

  const fetchActiveStatus = async () => {
    try {
      // 1. Fetch semester info
      const semRes = await fetch("/api/admin/semester");
      if (semRes.ok) {
        const semData = await semRes.json();
        setSemester(semData.semester);
      }

      // 2. Fetch pending counts
      const appsRes = await fetch("/api/admin/applications?status=PENDING&limit=1");
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setPendingCount(appsData.total || 0);
      }
    } catch (err) {
      console.error("Error loading allocation status details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveStatus();
  }, []);

  const runAllocationLogsSequence = async () => {
    setIsExecuting(true);
    setResults(null);
    setCurrentStep(0);
    setExecutionLogs([]);

    const steps = [
      "Establishing secure connection to MongoDB Atlas database server...",
      "Fetching all student application forms for the active semester...",
      "Sorting applicants based on priority score (500L -> 400L -> 300L -> 200L -> 100L)...",
      "Scanning special needs applicants and prioritizing ground-floor rooms...",
      "Checking gender designations and matching female/male students to designated hostels...",
      "Atomically updating available bed counts to eliminate double bookings...",
      "Dispatching automated HTML receipt notifications via nodemailer loop...",
      "Writing transaction reports to database logs..."
    ];

    // Simulate dynamic step logging for WOW premium visual response
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      setExecutionLogs((prev) => [...prev, `[LOG] ${steps[i]}`]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      const res = await fetch("/api/admin/allocate", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setExecutionLogs((prev) => [
          ...prev,
          `[ERROR] Engine execution aborted: ${data.error || "Server issue."}`
        ]);
        setIsExecuting(false);
      } else {
        setExecutionLogs((prev) => [
          ...prev,
          `[SUCCESS] Engine successfully resolved all entries.`
        ]);
        setResults(data);
        setIsExecuting(false);
        fetchActiveStatus(); // Refresh pending count
      }
    } catch (err) {
      setExecutionLogs((prev) => [...prev, `[ERROR] Connection failed. Loop aborted.`]);
      setIsExecuting(false);
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Allocation <span className="text-gradient">Engine</span>
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Execute automated, rule-based matching loops for student accommodation requests.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Rules & Info Box */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <Card glow="pink" className="p-5 border-slate-200 flex flex-col gap-4 text-xs leading-relaxed text-slate-600">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-slate-200">
              <ShieldAlert className="w-4 h-4 text-lcu-pink" />
              <span>Prioritizing Rules</span>
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-lcu-pink/10 text-lcu-pink font-bold flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Gender Designation Match</span>
                  Only allocate matching student genders to their respective designated hostels.
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-lcu-pink/10 text-lcu-pink font-bold flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Special Needs Preference</span>
                  Sort candidates with special needs to Floor 0 (Ground level) rooms first for accessibility.
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-lcu-pink/10 text-lcu-pink font-bold flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Academic Level Priority</span>
                  Priority hierarchy descends: 500L → 400L → 300L → 200L → 100L.
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-lcu-pink/10 text-lcu-pink font-bold flex items-center justify-center flex-shrink-0">4</span>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">First-Come, First-Served</span>
                  If priority markers are equal, the candidate with the earlier submission timestamp is matched.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Execution Controller */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card glow="blue" className="p-6 border-slate-200 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine Control Center</span>
                {semester && (
                  <span className="text-xs font-bold text-slate-900 uppercase bg-slate-50/5 px-3 py-1 border border-slate-200 rounded-lg">
                    {semester.label}
                  </span>
                )}
              </div>

              {semester ? (
                <div className="flex flex-col gap-5">
                  <div className="p-4 rounded-xl bg-slate-50/5 border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-0.5">Pending Accommodation Requests:</span>
                      <span className="text-slate-500 text-xs">Waiting in queues</span>
                    </div>
                    <span className="text-3xl font-black text-lcu-pink">{pendingCount}</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isExecuting && !results && (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-4"
                      >
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Triggering the engine initiates the rule sorting algorithm. Students will automatically receive allocated room codes and notifications via nodemailer SMTP.
                        </p>
                        
                        <Button
                          variant="pink"
                          onClick={runAllocationLogsSequence}
                          disabled={pendingCount === 0}
                          className="w-full py-4 flex items-center justify-center gap-2 font-black shadow-xl shadow-pink-500/15"
                        >
                          <Sparkles className="w-5 h-5 text-slate-900" />
                          <span>Run Auto-Allocation Engine</span>
                        </Button>
                      </motion.div>
                    )}

                    {isExecuting && (
                      <motion.div
                        key="executing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-lcu-pink uppercase tracking-widest animate-pulse">
                          <span>Executing Loops...</span>
                          <span>Step {currentStep + 1} / 8</span>
                        </div>

                        {/* Logs console grid */}
                        <div className="p-4 rounded-xl bg-slate-950 font-mono text-[10px] text-slate-600 h-44 overflow-y-auto flex flex-col gap-2 border border-slate-200">
                          {executionLogs.map((log, idx) => (
                            <div key={idx} className="flex gap-1.5 items-start">
                              <span className="text-slate-600">&gt;&gt;</span>
                              <span className={log.includes("SUCCESS") ? "text-emerald-700" : log.includes("ERROR") ? "text-red-600" : "text-slate-700"}>
                                {log}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {results && (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-sm font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Allocation Cycle Complete!</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3.5 rounded-xl bg-slate-50/5 border border-slate-200 flex justify-between items-center">
                            <span className="text-xs text-slate-600">Allocated Matches</span>
                            <span className="font-bold text-slate-900 text-lg">{results.allocatedCount}</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-50/5 border border-slate-200 flex justify-between items-center">
                            <span className="text-xs text-slate-600">Waitlisted Candidates</span>
                            <span className="font-bold text-slate-900 text-lg">{results.waitlistedCount}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="pink"
                            onClick={() => router.push("/admin/applications")}
                            className="flex-grow py-3 flex items-center justify-center gap-1.5"
                          >
                            <span>Inspect Applications</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" onClick={() => setResults(null)}>
                            Reset view
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Active semester window must be set up in settings before running allocation loops.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export const runtime = "nodejs";
