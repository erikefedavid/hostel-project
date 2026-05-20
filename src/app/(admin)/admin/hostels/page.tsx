"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Plus, Trash2, Home, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function HostelsManager() {
  const router = useRouter();
  const { data: session } = useSession();

  // Hostels lists
  const [hostels, setHostels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHostels = async () => {
    try {
      const res = await fetch("/api/admin/hostels");
      if (res.ok) {
        const data = await res.json();
        setHostels(data.hostels || []);
      }
    } catch (err) {
      console.error("Error loading hostels:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Hostel name is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/hostels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          gender,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create hostel.");
      } else {
        setSuccess("Hostel created successfully!");
        setName("");
        fetchHostels();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHostel = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this hostel? This action will fail if rooms are occupied.")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/hostels/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete hostel.");
      } else {
        setSuccess("Hostel deleted successfully!");
        fetchHostels();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("An error occurred during deletion.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  const isSuperadmin = (session?.user as any).role === "superadmin";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hostels <span className="text-gradient">Manager</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Create, edit gender definitions, and manage rooms inside LCU halls of residence.
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Hostel Form (Left Column) */}
        <div className="lg:col-span-1">
          <Card glow="pink" className="p-6 border-slate-200 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-lcu-pink" />
              <span>Create New Hostel</span>
            </h3>

            <form onSubmit={handleCreateHostel} className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  label="Hostel Name"
                  placeholder="e.g. Moremi Hall"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Gender Designation</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="glass-input px-4 py-3 rounded-xl text-base bg-white/85 focus:outline-none"
                >
                  <option value="male">Male (Boys)</option>
                  <option value="female">Female (Girls)</option>
                </select>
              </div>

              <Button variant="pink" type="submit" isLoading={isSubmitting} className="w-full py-3.5 mt-2">
                Create Hostel
              </Button>
            </form>
          </Card>
        </div>

        {/* Hostels Grid (Right Columns) */}
        <div className="lg:col-span-2">
          {hostels.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 border-slate-200">
              No halls of residence configured. Register one using the form.
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {hostels.map((hostel, idx) => {
                const totalB = hostel.totalBeds || 0;
                const occB = hostel.occupiedBeds || 0;
                const freeB = totalB - occB;

                return (
                  <motion.div
                    key={hostel._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      glow={hostel.gender === "male" ? "blue" : "pink"}
                      className="p-5 border-slate-200 h-full flex flex-col justify-between gap-5 relative overflow-hidden"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-slate-900 text-lg tracking-wide">
                            {hostel.name}
                          </h4>
                          <span
                            className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              hostel.gender === "male"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                            }`}
                          >
                            {hostel.gender}
                          </span>
                        </div>

                        {/* Room stats grid */}
                        <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50/5 border border-slate-200 flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rooms</span>
                            <span className="text-sm font-extrabold text-slate-900">
                              {hostel.totalRooms}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50/5 border border-slate-200 flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Free Beds</span>
                            <span className="text-sm font-extrabold text-emerald-700">
                              {freeB} / {totalB}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="pink"
                          size="sm"
                          onClick={() => router.push(`/admin/hostels/${hostel._id}`)}
                          className="flex-grow flex items-center justify-center gap-1.5 py-2.5"
                        >
                          <Home className="w-3.5 h-3.5" />
                          <span>Rooms ({hostel.totalRooms})</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>

                        {isSuperadmin && (
                          <button
                            onClick={() => handleDeleteHostel(hostel._id)}
                            className="p-2.5 rounded-xl border border-red-500/20 text-red-600 hover:text-slate-900 hover:bg-red-500/10 hover:border-red-500/40 transition-all cursor-pointer"
                            title="Delete Hostel"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export const runtime = "nodejs";
