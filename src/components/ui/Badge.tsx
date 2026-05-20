import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "pending" | "allocated" | "not_allocated" | "blue" | "pink" | "default";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", children, className }) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm border";

  const variants = {
    pending:
      "bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-amber-500/5",
    allocated:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5",
    not_allocated:
      "bg-red-500/10 text-red-400 border-red-500/25 shadow-red-500/5",
    blue:
      "bg-blue-500/10 text-blue-400 border-blue-500/25 shadow-blue-500/5",
    pink:
      "bg-pink-500/10 text-pink-400 border-pink-500/25 shadow-pink-500/5",
    default:
      "bg-slate-700/35 text-slate-300 border-slate-700/50 shadow-slate-900/5",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;
