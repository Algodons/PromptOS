import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "cyan" | "purple" | "green" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  cyan: [
    "bg-[rgba(0,245,255,0.1)] border border-[#00F5FF] text-[#00F5FF]",
    "hover:bg-[rgba(0,245,255,0.2)] hover:shadow-[0_0_20px_rgba(0,245,255,0.4)]",
    "active:bg-[rgba(0,245,255,0.3)]",
  ].join(" "),
  purple: [
    "bg-[rgba(168,85,247,0.1)] border border-[#A855F7] text-[#A855F7]",
    "hover:bg-[rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    "active:bg-[rgba(168,85,247,0.3)]",
  ].join(" "),
  green: [
    "bg-[rgba(0,255,136,0.1)] border border-[#00FF88] text-[#00FF88]",
    "hover:bg-[rgba(0,255,136,0.2)] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]",
    "active:bg-[rgba(0,255,136,0.3)]",
  ].join(" "),
  ghost: [
    "bg-transparent border border-[rgba(255,255,255,0.15)] text-gray-300",
    "hover:border-[rgba(255,255,255,0.3)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]",
  ].join(" "),
  danger: [
    "bg-[rgba(255,0,60,0.1)] border border-red-500 text-red-400",
    "hover:bg-[rgba(255,0,60,0.2)] hover:shadow-[0_0_20px_rgba(255,0,60,0.4)]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function NeonButton({
  variant = "cyan",
  size = "md",
  loading = false,
  icon,
  className,
  disabled,
  children,
  ...props
}: NeonButtonProps) {
  return (
    <button
      className={twMerge(
        clsx(
          "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-all duration-200 backdrop-blur-sm",
          "focus:outline-none focus:ring-2 focus:ring-[#00F5FF] focus:ring-offset-2 focus:ring-offset-[#05060A]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          loading && "opacity-70 cursor-wait",
          className
        )
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
