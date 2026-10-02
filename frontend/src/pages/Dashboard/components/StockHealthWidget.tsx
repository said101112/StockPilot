import React from "react";
import { TrendingUp } from "lucide-react";
import type { StockHealth } from "../types";

interface StockHealthWidgetProps {
  health: StockHealth;
}

export const StockHealthWidget: React.FC<StockHealthWidgetProps> = ({ health }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Santé Globale des Stocks
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-600 dark:text-gray-300">
              Stock Conforme ({health.inStockPct}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-600 dark:text-gray-300">
              Point de Commande ({health.lowStockPct}%)
            </span>
          </div>
          {health.outOfStockPct > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Rupture ({health.outOfStockPct}%)
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex">
        <div
          style={{ width: `${health.inStockPct}%` }}
          className="h-full bg-emerald-500 transition-all duration-500"
          title={`Stock Conforme: ${health.inStockPct}%`}
        />
        <div
          style={{ width: `${health.lowStockPct}%` }}
          className="h-full bg-amber-500 transition-all duration-500"
          title={`Proche du seuil: ${health.lowStockPct}%`}
        />
        <div
          style={{ width: `${health.outOfStockPct}%` }}
          className="h-full bg-rose-500 transition-all duration-500"
          title={`Rupture: ${health.outOfStockPct}%`}
        />
      </div>
    </div>
  );
};
