import React from "react";
import { RefreshCw } from "lucide-react";

export const PageFallback: React.FC = () => {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-xs dark:bg-brand-950/40 dark:text-brand-400">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
        Chargement du module...
      </p>
    </div>
  );
};
