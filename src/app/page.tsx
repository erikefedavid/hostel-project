"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  ShieldCheck,
  Zap,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Home,
  UserCheck,
  KeyRound
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

// Mock simulated hostel rooms
const INITIAL_ROOMS = [
  { id: 101, label: "Room 101", beds: ["occupied", "occupied", "available", "available"], type: "Male" },
  { id: 102, label: "Room 102", beds: ["occupied", "occupied", "occupied", "occupied"], type: "Female" },
  { id: 103, label: "Room 103", beds: ["occupied", "available", "available", "available"], type: "Male" },
  { id: 104, label: "Room 104", beds: ["occupied", "occupied", "occupied", "available"], type: "Female" },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Simulated live hostel room grid state
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [allocationStep, setAllocationStep] = useState(0);
  const [simulationLog, setSimulationLog] = useState("Standing by. Click Allocate to simulate engine.");

  // Simulate an automated allocation loop on the landing page
  const triggerSimulationStep = () => {
    setRooms((prevRooms) => {
      const nextRooms = [...prevRooms];
      if (allocationStep === 0) {
        // Allocate Room 101 bed
        nextRooms[0] = { ...nextRooms[0], beds: ["occupied", "occupied", "occupied", "available"] };
        setSimulationLog("Simulated match: 500L student assigned to Room 101 (Bed 3)");
        setAllocationStep(1);
      } else if (allocationStep === 1) {
        // Allocate Room 103 bed
        nextRooms[2] = { ...nextRooms[2], beds: ["occupied", "occupied", "available", "available"] };
        setSimulationLog("Simulated match: Special needs applicant assigned to Floor 0 Room 103 (Bed 2)");
        setAllocationStep(2);
      } else if (allocationStep === 2) {
        // Allocate Room 104 bed
        nextRooms[3] = { ...nextRooms[3], beds: ["occupied", "occupied", "occupied", "occupied"] };
        setSimulationLog("Simulated match: 400L candidate assigned to Room 104 (Bed 4) - Room Full!");
        setAllocationStep(3);
      } else {
        // Reset simulation
        setSimulationLog("Resetting floor plan occupancy layout...");
        setAllocationStep(0);
        return INITIAL_ROOMS;
      }
      return nextRooms;
    });
  };

  // Auto trigger simulation steps periodically for ambient feel
  useEffect(() => {
    const timer = setInterval(() => {
      triggerSimulationStep();
    }, 5000);
    return () => clearInterval(timer);
  }, [allocationStep]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role === "admin" || role === "superadmin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
  }, [session, status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
          <p className="text-slate-500 font-semibold animate-pulse">Establishing LCU secure context...</p>
        </div>
      </div>
    );
  }

  // Stagger entry configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <div className="flex-grow flex flex-col min-h-screen relative overflow-hidden bg-slate-50 text-slate-800 selection:bg-lcu-pink selection:text-slate-900">
      {/* Floating vector blurs using LCU brand colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-lcu-blue/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-lcu-pink/5 blur-[120px] pointer-events-none animate-pulse" />

      {/* Modern Sleek Navigation Menu - Bright Glass */}
      <header className="relative z-20 w-full px-6 py-5 border-b border-lcu-border bg-white/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-lcu-blue to-lcu-pink flex items-center justify-center shadow-lg shadow-pink-500/10 group-hover:scale-105 transition-transform duration-300">
              <Building className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-gradient">HAMS</span>
              <span className="text-[10px] block text-lcu-blue font-black tracking-widest uppercase mt-0.5">
                Lead City University
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="text-sm font-bold text-slate-600 hover:text-lcu-blue transition-colors cursor-pointer"
            >
              Portal Login
            </button>
            <Button
              variant="pink"
              size="sm"
              onClick={() => router.push("/register")}
              className="flex items-center gap-1.5 shadow-lg shadow-pink-500/15 font-black text-xs uppercase"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main hero page structure */}
      <main className="flex-grow flex flex-col justify-center items-center px-6 relative z-10 max-w-7xl mx-auto w-full py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-12 gap-16 items-center w-full"
        >
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 flex flex-col text-left gap-8">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-lcu-blue/5 to-lcu-pink/5 border border-lcu-pink/20 rounded-full px-4.5 py-1.5 w-fit"
            >
              <GraduationCap className="w-4 h-4 text-lcu-pink" />
              <span className="text-[10px] font-black uppercase tracking-widest text-lcu-pink">
                Halls of Residence allocation
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-slate-900">
                Transparent & Fair <br />
                <span className="text-gradient-lcu">Hostel Placements</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mt-2 font-medium">
                Welcome to the Lead City University **Hostel Allocation Management System (HAMS)**. Experience a fully automated, rule-based matching engine designed to ensure 100% transparent, priority-driven accommodation allocations instantly.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mt-2">
              <Button
                variant="pink"
                size="lg"
                className="px-8 py-4 shadow-xl shadow-pink-500/15 font-extrabold uppercase text-xs tracking-wider"
                onClick={() => router.push("/register")}
              >
                Start Student Application
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 font-extrabold uppercase text-xs tracking-wider border-slate-200 text-slate-700 hover:bg-slate-100"
                onClick={() => router.push("/login")}
              >
                Access Admin Portal
              </Button>
            </motion.div>

            {/* Quick stats indicators */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 border-t border-slate-200 pt-8 mt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-lcu-blue">0%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Double Bookings
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-lcu-pink">Priority</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Special Needs & 500L
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-lcu-blue-light">Instant</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Email Dispatch
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sleek Interactive Hostel Floor Grid Widget */}
          <div className="lg:col-span-5 relative w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lcu-pink/5 rounded-full blur-[80px] pointer-events-none" />

            <motion.div variants={itemVariants} className="relative z-10 w-full">
              <Card glow="pink" className="p-6 backdrop-blur-xl border-lcu-border bg-white/95 relative overflow-hidden flex flex-col gap-6 shadow-xl shadow-slate-100/50">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-lcu-blue" />
                    <span className="text-xs font-black uppercase tracking-wider text-lcu-blue">Senate Hall Wing A</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-lcu-pink bg-lcu-pink/5 px-2.5 py-1 rounded-full border border-lcu-pink/10">
                    Live Floor Plan
                  </span>
                </div>

                {/* Simulated Hostel Room Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <motion.div
                      key={room.id}
                      layout
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col gap-3 transition-colors relative hover:bg-slate-100/50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-800">{room.label}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          room.type === "Male" 
                            ? "text-blue-500 bg-blue-50"
                            : "text-pink-500 bg-pink-50"
                        }`}>
                          {room.type}
                        </span>
                      </div>

                      {/* Room Bed Layout Visualizer */}
                      <div className="grid grid-cols-4 gap-2">
                        {room.beds.map((bed, idx) => (
                          <div key={idx} className="relative group">
                            <motion.div
                              animate={{
                                scale: bed === "occupied" ? [1, 1.1, 1] : 1,
                                backgroundColor: bed === "occupied" ? "#ec4899" : "#10b981",
                              }}
                              transition={{ duration: 0.5 }}
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center cursor-pointer shadow-sm"
                            />
                            {/* Visual tooltip */}
                            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-50 text-slate-900 text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                              Bed {idx + 1}: {bed}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-500">
                        <span>Beds: {room.beds.filter(b => b === "available").length} / 4 free</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Live simulation logger box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-850 font-mono text-[10px] text-slate-700 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <p className="leading-snug">{simulationLog}</p>
                </div>

                {/* Simulated Trigger CTA */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-500">
                    <KeyRound className="w-3.5 h-3.5 text-lcu-blue" />
                    <span>Auto Bed-Lock Secure</span>
                  </div>
                  <button
                    onClick={triggerSimulationStep}
                    className="text-[10px] font-black uppercase text-lcu-pink hover:text-lcu-pink-vibrant cursor-pointer flex items-center gap-1"
                  >
                    <span>Simulation Step</span>
                    <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                  </button>
                </div>

              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <section className="grid md:grid-cols-3 gap-8 w-full mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full flex flex-col gap-4 p-7 border-slate-100 bg-white shadow-md shadow-slate-100 hover:border-lcu-pink/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-lcu-pink/10 border border-lcu-pink/20 flex items-center justify-center text-lcu-pink group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-850 group-hover:text-lcu-pink transition-colors">
                Rule-Based Automation
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Matches rooms instantly using the LCU Priority Protocol. Resolves allocation requests cleanly in seconds.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full flex flex-col gap-4 p-7 border-slate-100 bg-white shadow-md shadow-slate-100 hover:border-lcu-pink/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-lcu-blue/10 border border-lcu-blue/20 flex items-center justify-center text-lcu-blue group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-850 group-hover:text-lcu-blue transition-colors">
                Zero Discrepancies
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Strict gender segregation validation and atomic room capacity locks completely eliminate overbooking conflicts.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full flex flex-col gap-4 p-7 border-slate-100 bg-white shadow-md shadow-slate-100 hover:border-lcu-pink/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-lcu-blue-light/10 border border-lcu-blue-light/20 flex items-center justify-center text-lcu-blue-light group-hover:scale-105 transition-transform duration-300">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-850 group-hover:text-lcu-blue-light transition-colors">
                Registry Dashboard
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Empowers administrative teams with full occupancy insights, paginated registries, manual overrides, and printable records.
              </p>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Professional LCU HAMS Footer */}
      <footer className="relative z-10 w-full px-6 py-8 border-t border-slate-200 bg-slate-100 text-center text-xs text-slate-500 flex flex-col gap-2">
        <p>© 2026 Hostel Allocation Management System (HAMS) · Lead City University, Ibadan.</p>
        <p className="font-bold text-slate-600">
          Prepared with excellence for Ajodo Ojoanemile Oluwanifemi Godson (LCU/UG/22/24669)
        </p>
      </footer>
    </div>
  );
}
export const runtime = "nodejs";
