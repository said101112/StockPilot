import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: React.ReactNode;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  iconBgColor = "bg-brand-50 dark:bg-brand-950/40",
  iconTextColor = "text-brand-600 dark:text-brand-400",
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition-all hover:border-brand-500/30 ${
        highlight
          ? "border-amber-300 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBgColor} ${iconTextColor}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {value} {unit && <span className="text-base font-medium text-gray-400">{unit}</span>}
        </h3>
        {subtext && <div className="mt-1 text-xs text-gray-500">{subtext}</div>}
      </div>
    </div>
  );
};
