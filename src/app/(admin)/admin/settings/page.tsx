"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Calendar, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SettingsPage() {
  const [semesterLabel, setSemesterLabel] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSemesterSettings = async () => {
    try {
      const res = await fetch("/api/admin/semester");
      if (res.ok) {
        const data = await res.json();
        if (data.semester) {
          setSemesterLabel(data.semester.label || "");
          setIsOpen(!!data.semester.isOpen);
        }
      }
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesterSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterLabel.trim()) {
      setError("Semester name label is required.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/semester", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: semesterLabel.trim(),
          isOpen,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update semester settings.");
      } else {
        setSuccess("Hostel application settings updated successfully!");
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          System <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure semesters and toggle the student hostel application windows.
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
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
            <div className="relative">
              <Input
                label="Active Semester Period Label"
                type="text"
                placeholder="e.g. 2026/2027 First Semester"
                value={semesterLabel}
                onChange={(e) => setSemesterLabel(e.target.value)}
                required
                className="pl-11"
              />
              <Calendar className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            {/* Toggle Window Application state */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/5 border border-slate-200 select-none">
              <input
                id="isOpenToggle"
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                className="w-6 h-6 rounded-lg border-slate-300 text-lcu-pink bg-slate-50/5 focus:ring-lcu-pink cursor-pointer mt-0.5"
              />
              <div>
                <label htmlFor="isOpenToggle" className="text-sm font-bold text-slate-800 cursor-pointer block">
                  Open Student Applications Window
                </label>
                <span className="text-xs text-slate-600 block mt-0.5 leading-relaxed">
                  When enabled, students can see the application option in their dashboards and submit accommodation requests. Turning this off locks entries.
                </span>
              </div>
            </div>

            {/* Admin safety box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3 text-xs text-slate-600 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-lcu-pink flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 uppercase block mb-0.5">Administrative Safety Check:</span>
                Changing the semester label does not delete existing records. It shifts the context of all future applications. Ensure you announce settings updates to the student registry portal.
              </div>
            </div>

            <Button
              variant="pink"
              type="submit"
              isLoading={isSaving}
              className="py-3.5 mt-2"
            >
              Save Application Settings
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
export const runtime = "nodejs";
