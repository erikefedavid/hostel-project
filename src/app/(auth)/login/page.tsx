"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building, Lock, Mail, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email address or password.");
      } else {
        router.refresh();
        router.push("/");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card glow="pink" className="p-8 backdrop-blur-xl border-slate-300 relative">
          {/* LCU HAMS Header */}
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <div
              onClick={() => router.push("/")}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lcu-blue-light to-lcu-pink flex items-center justify-center shadow-lg shadow-pink-500/10 cursor-pointer mb-2"
            >
              <Building className="w-7 h-7 text-slate-900" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-wide">Welcome to HAMS</h2>
            <p className="text-sm text-slate-600">Hostel Allocation Management System</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-600"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                placeholder="example@lcu.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11"
              />
              <Mail className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11"
              />
              <Lock className="w-5 h-5 text-slate-500 absolute left-4 bottom-3.5" />
            </div>

            <Button variant="pink" type="submit" isLoading={isLoading} className="w-full py-3.5 mt-2">
              Sign In
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-lcu-pink hover:text-lcu-pink-light font-bold hover:underline cursor-pointer"
            >
              Create Student Account
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
export const runtime = "nodejs";
