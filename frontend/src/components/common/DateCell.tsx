import React from "react";
import { Clock } from "lucide-react";
import { formatDateWithTime } from "@/utils/dateUtils";

interface DateCellProps {
  date?: string | Date | null;
  updatedDate?: string | Date | null;
  showIcon?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}

export const DateCell: React.FC<DateCellProps> = ({
  date,
  updatedDate,
  showIcon = true,
  align = "left",
  className = "",
}) => {
  if (!date && !updatedDate) {
    return <span className="text-xs text-gray-400 font-mono">—</span>;
  }

  const primary = formatDateWithTime(date || updatedDate);
  const updated = updatedDate && updatedDate !== date ? formatDateWithTime(updatedDate) : null;

  const alignClass =
    align === "right"
      ? "items-end text-right"
      : align === "center"
      ? "items-center text-center"
      : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
        {showIcon && <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />}
        <span className="font-mono">{primary.date}</span>
        <span className="text-gray-400 font-normal">à</span>
        <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{primary.time}</span>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
        {primary.relative && (
          <span className="font-medium text-gray-500 dark:text-gray-400">
            {primary.relative}
          </span>
        )}
        {updated && (
          <span className="italic text-[10px] text-gray-400">
            (MAJ: {updated.time})
          </span>
        )}
      </div>
    </div>
  );
};
