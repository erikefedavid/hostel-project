"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Users, Shield, RefreshCw } from "lucide-react";

type User = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  matricNumber?: string;
  createdAt: string;
};

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/superadmin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        // Update local state
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to update role", error);
      alert("An unexpected error occurred while updating the role.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-lcu-blue-light" />
            User Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage roles and permissions for all registered accounts.
          </p>
        </div>
        
        <Button 
          onClick={fetchUsers} 
          disabled={isLoading}
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card hoverable className="p-0 overflow-hidden border-slate-200 bg-slate-50/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/5 border-b border-slate-300 text-xs uppercase tracking-wider text-slate-600">
                <th className="px-6 py-4 font-bold">Name & Email</th>
                <th className="px-6 py-4 font-bold">Matric No.</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-600">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-lcu-blue-light border-t-transparent animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-600">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lcu-blue-light/20 to-lcu-pink/20 border border-lcu-blue-light/20 flex items-center justify-center text-lcu-blue-light font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{user.fullName}</div>
                          <div className="text-xs text-slate-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {user.matricNumber || <span className="text-slate-500 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role === "superadmin" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lcu-blue-light/20 text-lcu-blue-light text-xs font-bold border border-lcu-blue-light/30">
                          <Shield className="w-3.5 h-3.5" />
                          Superadmin
                        </span>
                      ) : (
                        <select
                          disabled={isUpdating === user._id}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-lcu-blue-light focus:border-lcu-blue-light disabled:opacity-50 transition-all outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export const runtime = "edge"; // Assuming it uses edge or nodejs, standard page component doesn't need this typically, but sticking to next.js config if needed.
