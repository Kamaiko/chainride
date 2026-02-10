import type { FC } from "react";
import { cn } from "../../lib/cn";

type SkeletonType = "card" | "detail" | "list-item";

const componentMap: Record<SkeletonType, FC> = {
  card: CardSkeleton,
  detail: DetailSkeleton,
  "list-item": ListItemSkeleton,
};

const layoutMap: Record<SkeletonType, string> = {
  card: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  detail: "space-y-4",
  "list-item": "space-y-4",
};

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn("bg-white/5 rounded-lg animate-pulse", className)} />;
}

function CardSkeleton() {
  return (
    <div className="glass p-5 space-y-3">
      <SkeletonPulse className="h-6 w-2/3" />
      <SkeletonPulse className="h-4 w-1/4" />
      <SkeletonPulse className="h-8 w-1/2 mt-4" />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="glass p-6 space-y-4">
        <SkeletonPulse className="h-8 w-1/3" />
        <SkeletonPulse className="h-4 w-1/4" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <SkeletonPulse className="h-16" />
          <SkeletonPulse className="h-16" />
          <SkeletonPulse className="h-16" />
          <SkeletonPulse className="h-16" />
        </div>
      </div>
      <div className="glass p-6 space-y-4">
        <SkeletonPulse className="h-6 w-1/3" />
        <SkeletonPulse className="h-10" />
        <SkeletonPulse className="h-10" />
        <SkeletonPulse className="h-12" />
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="glass p-5 space-y-3">
      <div className="flex justify-between">
        <SkeletonPulse className="h-5 w-1/3" />
        <SkeletonPulse className="h-5 w-20" />
      </div>
      <SkeletonPulse className="h-4 w-1/2" />
    </div>
  );
}

interface LoadingSkeletonProps {
  type: SkeletonType;
  count?: number;
}

export default function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  const Component = componentMap[type];

  return (
    <div className={layoutMap[type]}>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
