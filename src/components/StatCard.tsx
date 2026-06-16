import { ReactNode } from "react";
import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconBg = "bg-primary-50",
  iconColor = "text-primary-600",
}: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5 flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
          {value}
        </p>
      </div>
    </Card>
  );
}
