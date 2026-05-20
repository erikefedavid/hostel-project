import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "blue" | "pink" | "none";
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = "none", hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
          hoverable ? "glass-panel-hover" : "",
          glow === "blue" ? "shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)] border-blue-500/10" : "",
          glow === "pink" ? "shadow-[0_0_50px_-12px_rgba(217,70,239,0.15)] border-pink-500/10" : "",
          className
        )}
        {...props}
      >
        {/* Glow ambient background element */}
        {glow !== "none" && (
          <div
            className={cn(
              "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20",
              glow === "blue" ? "bg-blue-500" : "bg-pink-500"
            )}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
