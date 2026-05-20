"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Home, Plus, Trash2, Edit2, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function HostelDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { id: hostelId } = React.use(params);

  // Data states
  const [hostel, setHostel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Room Form
  const [roomNumber, setRoomNumber] = useState("");
  const [block, setBlock] = useState("A");
  const [floor, setFloor] = useState("0");
  const [capacity, setCapacity] = useState("4");
  
  // UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      // Fetch hostel info
      const hostelRes = await fetch(`/api/admin/hostels/${hostelId}`);
      if (hostelRes.ok) {
        const hData = await hostelRes.json();
        setHostel(hData.hostel);
      }

      // Fetch hostel rooms
      const roomsRes = await fetch(`/api/admin/hostels/${hostelId}/rooms`);
      if (roomsRes.ok) {
        const rData = await roomsRes.json();
        setRooms(rData.rooms || []);
      }
    } catch (err) {
      console.error("Error loading room details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hostelId]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError("Room number is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/hostels/${hostelId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: roomNumber.trim(),
          block: block.trim().toUpperCase(),
          floor: Number(floor),
          capacity: Number(capacity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create room.");
      } else {
        setSuccess("Room added successfully!");
        setRoomNumber("");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm("Are you sure you want to delete this room? This action will fail if any student is assigned.")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/rooms/${roomId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete room.");
      } else {
        setSuccess("Room deleted successfully!");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("An error occurred during room deletion.");
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
      {/* Top back navigation */}
      <button
        onClick={() => router.push("/admin/hostels")}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider transition-colors mr-auto cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Hostels</span>
      </button>

      {/* Hostel Details Header */}
      {hostel && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{hostel.name}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                  hostel.gender === "male"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                }`}
              >
                {hostel.gender}
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Room configurations grid and vacancy listings.
            </p>
          </div>

          <div className="text-xs bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 w-fit">
            Total Rooms: <span className="font-bold text-slate-900">{rooms.length}</span>
          </div>
        </div>
      )}

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
        {/* Create Room Form (Left Column) */}
        <div className="lg:col-span-1">
          <Card glow="pink" className="p-6 border-slate-200 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-lcu-pink" />
              <span>Add New Room</span>
            </h3>

            <form onSubmit={handleAddRoom} className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  label="Room Number / Name"
                  placeholder="e.g. 101"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Block Label"
                    placeholder="e.g. A"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Floor Level</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="glass-input px-4 py-3 rounded-xl text-base bg-white/85 focus:outline-none"
                  >
                    <option value="0">Ground Floor (0)</option>
                    <option value="1">1st Floor (1)</option>
                    <option value="2">2nd Floor (2)</option>
                    <option value="3">3rd Floor (3)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Room Capacity (Beds)</label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="glass-input px-4 py-3 rounded-xl text-base bg-white/85 focus:outline-none"
                >
                  <option value="2">2 Beds</option>
                  <option value="4">4 Beds</option>
                  <option value="6">6 Beds</option>
                  <option value="8">8 Beds</option>
                </select>
              </div>

              <Button variant="pink" type="submit" isLoading={isSubmitting} className="w-full py-3.5 mt-2">
                Create Room
              </Button>
            </form>
          </Card>
        </div>

        {/* Rooms Listing (Right Columns) */}
        <div className="lg:col-span-2">
          {rooms.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 border-slate-200">
              No rooms added to this hostel. Register a room using the creation panel.
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {rooms.map((room, idx) => {
                const total = room.capacity || 0;
                const av = room.availableBeds;
                const occ = total - av;

                return (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card
                      glow={room.availableBeds === 0 ? "pink" : "blue"}
                      className="p-5 border-slate-200 h-full flex flex-col justify-between gap-4 relative"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                            <Home className="w-5 h-5 text-lcu-pink" />
                            <span>Room {room.roomNumber}</span>
                          </h4>
                          <span className="text-xs bg-slate-50/5 border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-600 font-bold uppercase">
                            Block {room.block}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1.5 text-xs">
                          <div className="p-2 rounded-xl bg-slate-50/5 border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Floor</span>
                            <span className="font-extrabold text-slate-900">
                              {room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50/5 border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Occupancy</span>
                            <span className={`font-extrabold ${av === 0 ? "text-red-600 animate-pulse" : "text-emerald-700"}`}>
                              {occ} / {total} Beds Occupied
                            </span>
                          </div>
                        </div>
                      </div>

                      {isSuperadmin && (
                        <div className="flex gap-2 justify-end border-t border-slate-200 pt-3">
                          <button
                            onClick={() => handleDeleteRoom(room._id)}
                            className="p-2 rounded-xl border border-red-500/20 text-red-600 hover:text-slate-900 hover:bg-red-500/10 hover:border-red-500/40 transition-all cursor-pointer text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
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
