type SkeletonType = "card" | "detail" | "list-item";

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 rounded-lg animate-pulse ${className}`} />;
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
  const Component = type === "card" ? CardSkeleton : type === "detail" ? DetailSkeleton : ListItemSkeleton;
  const layout = type === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4";

  return (
    <div className={layout}>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
