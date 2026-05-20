"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Printer, Calendar, BarChart3, TrendingUp, Sparkles, Building2, HelpCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ReportsCenter() {
  // Statistics State
  const [summary, setSummary] = useState<any>(null);
  const [occupancyReport, setOccupancyReport] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      // 1. Fetch Summary
      const sumRes = await fetch("/api/admin/reports/summary");
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }

      // 2. Fetch Occupancy Details
      const occRes = await fetch("/api/admin/reports/occupancy");
      if (occRes.ok) {
        const occData = await occRes.json();
        setOccupancyReport(occData.report || []);
      }
    } catch (err) {
      console.error("Error loading report center:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  // Calculated Overall Stats
  const totalRooms = occupancyReport.reduce((sum, r) => sum + r.totalRooms, 0);
  const totalCapacity = occupancyReport.reduce((sum, r) => sum + r.totalCapacity, 0);
  const occupiedBeds = occupancyReport.reduce((sum, r) => sum + r.occupiedBeds, 0);
  const availableBeds = occupancyReport.reduce((sum, r) => sum + r.availableBeds, 0);
  const totalOccupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full relative">
      {/* Top Header - Hidden during print automatically */}
      <div className="no-print flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-lcu-pink" />
            <span>Reports Center</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Print official LCU hostel allocation reports, occupancy analytics, and gender breakouts.
          </p>
        </div>

        <Button
          variant="pink"
          onClick={handlePrint}
          className="w-fit flex items-center gap-2 py-3 px-5 shadow-xl shadow-pink-500/10 font-bold"
        >
          <Printer className="w-4 h-4 text-slate-900" />
          <span>Print / Export PDF</span>
        </Button>
      </div>

      {/* --- PRINT SHEET CONTAINER: ONLY VISIBLE WHEN PRINTING OR ON DISPLAY --- */}
      <div className="flex flex-col gap-6">
        {/* Printable Official LCU Header */}
        <div className="print-header hidden flex-col items-center text-center pb-6 border-b-2 border-slate-900 mb-6">
          <h2 className="text-2xl font-black tracking-wider text-slate-900">LEAD CITY UNIVERSITY</h2>
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-1">Hostel Allocation Management System (HAMS)</h3>
          <p className="text-xs text-slate-500 mt-1">
            Date Generated: {new Date().toLocaleDateString()} · Active Semester: {summary?.semester || "N/A"}
          </p>
        </div>

        {/* Executive Summary Cards Block */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 border-slate-200 print-border flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Hostels</span>
            <span className="text-2xl font-black text-slate-900 print-dark text-gradient">{occupancyReport.length} Halls</span>
            <span className="text-[10px] text-slate-600 font-medium">{totalRooms} Registered Rooms</span>
          </Card>

          <Card className="p-5 border-slate-200 print-border flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bed Capacity</span>
            <span className="text-2xl font-black text-slate-900 print-dark text-gradient">{totalCapacity} Beds</span>
            <span className="text-[10px] text-slate-600 font-medium">{availableBeds} Free Allocations</span>
          </Card>

          <Card className="p-5 border-slate-200 print-border flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Occupied Beds</span>
            <span className="text-2xl font-black text-slate-900 print-dark text-gradient">{occupiedBeds} Students</span>
            <span className="text-[10px] text-slate-600 font-medium">{totalOccupancyRate}% Occupancy Rate</span>
          </Card>

          <Card className="p-5 border-slate-200 print-border flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Submitted Apps</span>
            <span className="text-2xl font-black text-slate-900 print-dark text-gradient">{summary?.summary.totalApplications || 0} Entries</span>
            <span className="text-[10px] text-slate-600 font-medium">{summary?.summary.pendingCount || 0} Pending Matching</span>
          </Card>
        </div>

        {/* Breakdown split columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Detailed Occupancy Table (Left Columns) */}
          <div className="lg:col-span-2">
            <Card glow="blue" className="p-6 border-slate-200 print-card h-full">
              <h3 className="text-lg font-bold text-slate-900 print-dark mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lcu-pink no-print" />
                <span>Halls of Residence Occupancy Rates</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white/2 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="p-3 pl-4">Hostel Name</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Rooms</th>
                      <th className="p-3">Capacity</th>
                      <th className="p-3">Occupied</th>
                      <th className="p-3 pr-4 text-right">Occupancy Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-700 print-table-body">
                    {occupancyReport.map((h) => (
                      <tr key={h.hostelId} className="hover:bg-white/2">
                        <td className="p-3 pl-4 font-bold text-slate-900 print-dark">{h.name}</td>
                        <td className="p-3 uppercase font-semibold text-slate-600">{h.gender}</td>
                        <td className="p-3">{h.totalRooms}</td>
                        <td className="p-3">{h.totalCapacity}</td>
                        <td className="p-3">{h.occupiedBeds}</td>
                        <td className="p-3 pr-4 text-right font-bold text-lcu-pink">{h.occupancyRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Breakdown graphics (Right Columns) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card glow="pink" className="p-6 border-slate-200 print-card">
              <h3 className="text-base font-bold text-slate-900 print-dark mb-4">Academic Level Demographics</h3>
              
              <div className="flex flex-col gap-3 text-xs">
                {summary &&
                  Object.entries(summary.summary.levelBreakdown || {}).map(([lvl, count]: any) => (
                    <div key={lvl} className="flex justify-between items-center py-2 border-b border-white/2">
                      <span className="font-semibold text-slate-600">{lvl} Level Candidates</span>
                      <span className="font-extrabold text-slate-900 print-dark">{count} Students</span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card glow="pink" className="p-6 border-slate-200 print-card">
              <h3 className="text-base font-bold text-slate-900 print-dark mb-4">Gender Breakout Demographics</h3>
              
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-white/2">
                  <span className="font-semibold text-slate-600">Male Applications</span>
                  <span className="font-extrabold text-slate-900 print-dark">{summary?.summary.genderBreakdown.male || 0} Students</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-slate-600">Female Applications</span>
                  <span className="font-extrabold text-slate-900 print-dark">{summary?.summary.genderBreakdown.female || 0} Students</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Printable Official Footer Signature */}
        <div className="print-footer hidden justify-between items-center mt-12 border-t-2 border-slate-900 pt-6">
          <div className="flex flex-col items-center">
            <div className="w-40 h-0.5 bg-slate-50 mb-2" />
            <span className="text-xs font-bold text-slate-600">Student Registry Officer</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-40 h-0.5 bg-slate-50 mb-2" />
            <span className="text-xs font-bold text-slate-600">Hall Warden / Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export const runtime = "nodejs";
