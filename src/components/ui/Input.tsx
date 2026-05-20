import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 ml-1">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "glass-input w-full px-4 py-3 rounded-xl text-base placeholder-slate-400 focus:outline-none transition-all duration-200 text-slate-900 bg-white",
            error ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/25" : "",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-red-600 mt-0.5 ml-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
