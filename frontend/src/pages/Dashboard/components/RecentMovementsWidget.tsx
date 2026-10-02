import React from "react";
import { Link } from "react-router";
import { Activity, ArrowRight } from "lucide-react";
import type { StockMovement } from "@/features/movements/domain/types";
import type { Product } from "@/features/products/domain/types";
import { ModernStatusBadge } from "@/components/common/ModernStatusBadge";
import { DateCell } from "@/components/common/DateCell";

interface RecentMovementsWidgetProps {
  movements: StockMovement[];
  productMap: Record<string, Product>;
}

export const RecentMovementsWidget: React.FC<RecentMovementsWidgetProps> = ({
  movements,
  productMap,
}) => {

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Derniers Mouvements
          </h2>
        </div>
        <Link
          to="/movements"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          Historique complet <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3">N° Mouvement</th>
              <th className="px-4 py-3">Opération</th>
              <th className="px-4 py-3">Article & Référence</th>
              <th className="px-4 py-3 text-center">Quantité</th>
              <th className="px-4 py-3">Référence / Motif</th>
              <th className="px-4 py-3 text-right">Date & Heure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                  Aucun mouvement enregistré pour l'instant.
                </td>
              </tr>
            ) : (
              movements.map((mov) => {
                const prod = productMap[mov.productId];

                return (
                  <tr
                    key={mov.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900 dark:text-white">
                      {mov.movementNumber}
                    </td>
                    <td className="px-4 py-3">
                      <ModernStatusBadge status={mov.type} fixedWidth={true} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white text-xs">
                          {prod ? prod.name : "Article"}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          Réf : {prod ? prod.sku : mov.productId.substring(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-mono text-xs font-bold ${
                          mov.quantity > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} PCS
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {mov.referenceDocument || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DateCell date={mov.timestamp} align="right" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
