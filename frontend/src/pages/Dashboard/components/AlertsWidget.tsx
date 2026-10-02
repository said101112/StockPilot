import React from "react";
import { Link } from "react-router";
import Button from "@/components/ui/button/Button";
import { ShieldAlert, ArrowRight, CheckCircle2, ShoppingCart } from "lucide-react";
import type { StockAlert } from "@/features/alerts/domain/types";
import type { Product } from "@/features/products/domain/types";
import { ModernStatusBadge } from "@/components/common/ModernStatusBadge";
import { DateCell } from "@/components/common/DateCell";

interface AlertsWidgetProps {
  alerts: StockAlert[];
  productMap: Record<string, Product>;
  actionLabel?: string;
  onAction: (productId: string) => void;
}

export const AlertsWidget: React.FC<AlertsWidgetProps> = ({
  alerts,
  productMap,
  actionLabel = "Approvisionner",
  onAction,
}) => {

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Alertes de Réapprovisionnement
          </h2>
        </div>
        <Link
          to="/alerts"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          Voir toutes les alertes <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Aucune alerte active
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Tous les stocks respectent les points de commande.
            </p>
          </div>
        ) : (
          alerts.map((al) => {
            const prod = productMap[al.productId];
            const pct =
              al.reorderPoint > 0
                ? Math.min(100, Math.round((al.currentStock / al.reorderPoint) * 100))
                : 0;

            return (
              <div
                key={al.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {prod ? prod.name : "Article"}
                    </span>
                    <span className="rounded-md bg-gray-200/70 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {prod ? prod.sku : al.productId.substring(0, 8)}
                    </span>
                    <ModernStatusBadge status={al.severity} fixedWidth={false} />
                  </div>

                  {/* Jauge visuelle de niveau de stock & date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full ${
                            al.currentStock === 0
                              ? "bg-rose-600"
                              : pct <= 50
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Actuel :{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {al.currentStock} PCS
                        </strong>{" "}
                        / Seuil : {al.reorderPoint} PCS
                      </span>
                    </div>

                    <DateCell date={al.createdAt} align="right" />
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onAction(al.productId)}
                    className="gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white w-full sm:w-auto"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {actionLabel}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
