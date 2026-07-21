"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  LayoutDashboard,
  Users,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  FolderOpen
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 rounded-full border-4 border-lcu-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    (session?.user && (session.user as any).role !== "admin" && (session.user as any).role !== "superadmin")
  ) {
    return null; // Managed by middleware redirects
  }

  const navItems = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Applications", path: "/admin/applications", icon: Users },
    { name: "Hostels Manager", path: "/admin/hostels", icon: Building },
    { name: "Run Allocation", path: "/admin/allocate", icon: ShieldAlert },
    { name: "Reports Center", path: "/admin/reports", icon: BarChart3 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const roleLabel = (session?.user as any).role === "superadmin" ? "Super Admin" : "Hostel Admin";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 relative z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lcu-blue-light to-lcu-pink flex items-center justify-center shadow-md">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-gradient tracking-wide block">LCU HAMS</span>
            <span className="text-[9px] font-bold text-lcu-pink tracking-wider uppercase">{roleLabel}</span>
          </div>
        </div>

        <nav className="flex-grow px-4 py-6 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-lcu-blue-vibrant/25 to-lcu-blue-light/10 text-blue-400 border border-blue-500/35 shadow-md shadow-blue-500/5"
                    : "border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin profile detail card */}
        <div className="p-4 border-t border-slate-200 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/5 border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-sm text-white">
              {session?.user.name ? session.user.name.charAt(0) : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{session?.user.name}</p>
              <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest truncate">
                {roleLabel}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 text-red-600 hover:text-white text-xs font-extrabold uppercase transition-all shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-200 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-lcu-blue-light to-lcu-pink flex items-center justify-center">
            <Building className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-gradient tracking-wide text-sm">LCU HAMS</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50/5 transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-[65px] bg-slate-950/95 border-b border-slate-200 p-6 flex flex-col gap-4 z-10 backdrop-blur-xl"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(item.path);
                    }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-lcu-blue-vibrant/20 to-lcu-blue-light/10 text-blue-400 border border-blue-500/35"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-sm text-white">
                  {session?.user.name ? session.user.name.charAt(0) : "A"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{session?.user.name}</p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                    {roleLabel}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/20 text-red-600 text-xs font-bold uppercase"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col p-6 md:p-8 relative z-10 overflow-y-auto max-h-[100vh]">
        {children}
      </main>
    </div>
  );
}
export const runtime = "nodejs";
