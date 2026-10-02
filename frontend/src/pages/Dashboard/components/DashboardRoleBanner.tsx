import React from "react";
import Badge from "@/components/ui/badge/Badge";

interface DashboardRoleBannerProps {
  title: string;
  roleBadgeText: string;
  roleBadgeColor: "primary" | "warning" | "success" | "info";
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  actionBadge?: React.ReactNode;
}

export const DashboardRoleBanner: React.FC<DashboardRoleBannerProps> = ({
  title,
  roleBadgeText,
  roleBadgeColor,
  description,
  icon,
  iconBgColor,
  actionBadge,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-5 dark:border-gray-800 dark:from-gray-900/60 dark:to-gray-900 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm shrink-0 ${iconBgColor}`}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <Badge color={roleBadgeColor} size="sm">
                {roleBadgeText}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          </div>
        </div>
        {actionBadge && <div className="shrink-0">{actionBadge}</div>}
      </div>
    </div>
  );
};
