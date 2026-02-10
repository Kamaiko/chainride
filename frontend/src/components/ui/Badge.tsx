import type { ReactNode } from "react";

type BadgeVariant = "success" | "error" | "info" | "warning" | "neutral";

const variants: Record<BadgeVariant, string> = {
  success: "bg-green-500/15 text-green-400 border-green-500/20",
  error: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  neutral: "bg-white/10 text-slate-400 border-white/10",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${variants[variant]}`}>
      {children}
    </span>
  );
}
