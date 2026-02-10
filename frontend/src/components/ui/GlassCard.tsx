import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface GlassCardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export default function GlassCard({ children, hover, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass p-5",
        hover && "transition-transform duration-200 hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
