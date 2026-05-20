"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Building, ShieldAlert, Award, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  const router = useRouter();

  // Statistics State
  const [stats, setStats] = useState<any>({
    totalApplications: 0,
    allocatedCount: 0,
    notAllocatedCount: 0,
    pendingCount: 0,
    genderBreakdown: { male: 0, female: 0 },
    levelBreakdown: { "100": 0, "200": 0, "300": 0, "400": 0, "500": 0 },
  });

  const [hostels, setHostels] = useState<any[]>([]);
  const [semester, setSemester] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Semester
      const semRes = await fetch("/api/admin/semester");
      let activeSemLabel = "";
      if (semRes.ok) {
        const semData = await semRes.json();
        setSemester(semData.semester);
        activeSemLabel = semData.semester?.label || "";
      }

      // 2. Fetch Summary Report Stats
      const reportRes = await fetch("/api/admin/reports/summary");
      if (reportRes.ok) {
        const repData = await reportRes.json();
        setStats(repData.summary);
      }

      // 3. Fetch Hostels list for quick capacities list
      const hostRes = await fetch("/api/admin/hostels");
      if (hostRes.ok) {
        const hostData = await hostRes.json();
        setHostels(hostData.hostels || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  // Calculated variables
  const totalBeds = hostels.reduce((sum, h) => sum + (h.totalBeds || 0), 0);
  const occupiedBeds = hostels.reduce((sum, h) => sum + (h.occupiedBeds || 0), 0);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const cardsData = [
    {
      title: "Total Applications",
      value: stats.totalApplications,
      subtitle: `${stats.pendingCount} Pending Loop`,
      icon: Users,
      color: "pink",
      path: "/admin/applications",
    },
    {
      title: "Beds Occupied",
      value: `${occupiedBeds} / ${totalBeds}`,
      subtitle: `${availableBeds} Available Slots`,
      icon: Building,
      color: "blue",
      path: "/admin/hostels",
    },
    {
      title: "Occupancy Percentage",
      value: `${occupancyPercentage}%`,
      subtitle: "Across All Hostels",
      icon: Award,
      color: "pink",
      path: "/admin/reports",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">System Overview</h1>
          <p className="text-sm text-slate-600">
            Automated Hostel Allocation command center details.
          </p>
        </div>

        {semester ? (
          <div className="flex items-center gap-3 bg-slate-50/5 border border-slate-200 rounded-xl px-4 py-2 text-xs">
            <Calendar className="w-4 h-4 text-lcu-pink" />
            <div>
              <span className="text-slate-600 font-medium block">Semester Label</span>
              <span className="font-bold text-slate-900 uppercase">{semester.label}</span>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ml-1 ${
                semester.isOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
          </div>
        ) : (
          <div className="text-xs bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl text-slate-600">
            No Semester Configured
          </div>
        )}
      </div>

      {/* Widgets Summary Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(card.path)}
              className="cursor-pointer"
            >
              <Card hoverable glow={card.color as any} className="p-6 border-slate-200 h-full">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className="text-3xl font-black text-slate-900">{card.value}</span>
                    <span className="text-xs text-slate-500 font-medium mt-1">{card.subtitle}</span>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      card.color === "pink"
                        ? "bg-lcu-pink/10 border border-lcu-pink/25 text-lcu-pink"
                        : "bg-lcu-blue-light/10 border border-lcu-blue-light/25 text-blue-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main split dashboard panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hostel Occupancy visual progress panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card glow="blue" className="p-6 border-slate-200 flex-grow">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center justify-between">
              <span>Hostel Occupancy Rates</span>
              <button
                onClick={() => router.push("/admin/hostels")}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
              >
                <span>Hostels List</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </h3>

            {hostels.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No hostels configured yet. Go to Hostels Manager to add one.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {hostels.map((h) => (
                  <div key={h._id} className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50/5 border border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{h.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                            h.gender === "male"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                          }`}
                        >
                          {h.gender}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600">
                        {h.occupiedBeds} / {h.totalBeds} Beds ({h.occupancyPercentage}%)
                      </span>
                    </div>

                    {/* Progress Bar slider */}
                    <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        style={{ width: `${h.occupancyPercentage}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          h.gender === "male"
                            ? "bg-gradient-to-r from-blue-600 to-blue-400"
                            : "bg-gradient-to-r from-pink-600 to-pink-400"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick engines status side panel */}
        <div>
          <Card glow="pink" className="p-6 border-slate-200 h-full flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Allocation Actions</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Retrieve accommodation requests for the open semester window and trigger the allocation engine automatically.
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50/5 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold">Pending Requests:</span>
                  <span className="text-sm font-black text-lcu-pink">{stats.pendingCount}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/5 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold">Allocated Students:</span>
                  <span className="text-sm font-black text-emerald-700">{stats.allocatedCount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="pink"
                onClick={() => router.push("/admin/allocate")}
                disabled={stats.pendingCount === 0 || (semester && !semester.isOpen)}
                className="w-full py-3.5 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>Open Engine</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/admin/settings")}
                className="w-full py-3"
              >
                Configure Semesters
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export const runtime = "nodejs";
