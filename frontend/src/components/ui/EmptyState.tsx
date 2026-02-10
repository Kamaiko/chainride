import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="flex justify-center text-slate-500">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
      <p className="text-slate-500 max-w-md mx-auto">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-block gradient-btn px-6 py-2.5 mt-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
