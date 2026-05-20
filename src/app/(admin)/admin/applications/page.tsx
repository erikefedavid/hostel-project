"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, FileText, ArrowRight, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

export default function ApplicationsPage() {
  const router = useRouter();

  // Filters State
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  // Paginated data list
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination details
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        query,
        status: statusFilter,
        gender: genderFilter,
        level: levelFilter,
      });

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter, genderFilter, levelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Accommodation <span className="text-gradient">Applications</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Review accommodation requests, inspect student priority metrics, and configure manually.
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            setPage(1);
            fetchApplications();
          }}
          className="w-fit flex items-center gap-1.5 py-2 px-3 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter and Search command card */}
      <Card glow="pink" className="p-5 border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Query input */}
          <div className="lg:col-span-2 relative">
            <Input
              label="Search Student"
              placeholder="Enter name or matric number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11"
            />
            <Search className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="glass-input px-3 py-3 rounded-xl text-sm bg-white/85 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="NOT_ALLOCATED">Not Allocated</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Gender</label>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="glass-input px-3 py-3 rounded-xl text-sm bg-white/85 focus:outline-none"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setPage(1);
              }}
              className="glass-input px-3 py-3 rounded-xl text-sm bg-white/85 focus:outline-none"
            >
              <option value="">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
          </div>
        </form>
      </Card>

      {/* Main Table view */}
      <Card glow="blue" className="border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No applications match the current filter selection criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-white/2 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                  <th className="p-4 pl-6">Student Name</th>
                  <th className="p-4">Matric Number</th>
                  <th className="p-4">Priority (Level)</th>
                  <th className="p-4">Submit Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {applications.map((app) => {
                  const student = app.studentId || {};
                  return (
                    <tr
                      key={app._id}
                      onClick={() => router.push(`/admin/applications/${app._id}`)}
                      className="hover:bg-white/2 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 group-hover:text-lcu-pink transition-colors">
                            {student.fullName || "Unregistered Student"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            {student.gender || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-700">
                        {student.matricNumber || "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{student.level || "—"}L</span>
                          {student.specialNeeds && (
                            <span className="text-[9px] font-extrabold text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                              NEEDS
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {formatDate(app.submittedAt)}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            app.status === "ALLOCATED"
                              ? "allocated"
                              : app.status === "NOT_ALLOCATED"
                              ? "not_allocated"
                              : "pending"
                          }
                          className="text-[10px]"
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/applications/${app._id}`);
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-900">{page}</span> of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export const runtime = "nodejs";
