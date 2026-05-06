import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type GlassVariant = "default" | "cyan" | "purple" | "green" | "danger";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  glow?: boolean;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
  children: React.ReactNode;
}

const variantStyles: Record<GlassVariant, string> = {
  default: "border-[rgba(0,245,255,0.2)]",
  cyan: "border-[rgba(0,245,255,0.4)] shadow-[0_0_20px_rgba(0,245,255,0.15)]",
  purple: "border-[rgba(168,85,247,0.4)] shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  green: "border-[rgba(0,255,136,0.4)] shadow-[0_0_20px_rgba(0,255,136,0.15)]",
  danger: "border-[rgba(255,0,0,0.4)] shadow-[0_0_20px_rgba(255,0,0,0.15)]",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function GlassCard({
  variant = "default",
  glow = false,
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "relative rounded-xl border backdrop-blur-[12px]",
          "bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]",
          variantStyles[variant],
          paddingStyles[padding],
          glow && "animate-pulse-neon",
          hover && "transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(0,245,255,0.15)] hover:-translate-y-0.5 cursor-pointer",
          className
        )
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.3)] to-transparent" />
      </div>
      {children}
    </div>
  );
}
