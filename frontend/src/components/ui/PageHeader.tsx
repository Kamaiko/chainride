import type { ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}

export default function PageHeader({ icon, title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <span className="text-primary">{icon}</span>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>
      {action}
    </div>
  );
}
