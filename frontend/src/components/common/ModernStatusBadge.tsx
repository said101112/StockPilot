import React from "react";

export type ModernBadgeColor =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "slate";

interface ModernStatusBadgeProps {
  status?: string;
  label?: string;
  color?: ModernBadgeColor;
  dotPulse?: boolean;
  fixedWidth?: boolean;
  className?: string;
}

const colorStyles: Record<
  ModernBadgeColor,
  { bg: string; text: string; border: string; dot: string }
> = {
  primary: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800/60",
    dot: "bg-blue-500",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/60",
    dot: "bg-amber-500",
  },
  danger: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/60",
    dot: "bg-rose-500",
  },
  info: {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800/60",
    dot: "bg-cyan-500",
  },
  slate: {
    bg: "bg-gray-100 dark:bg-gray-800/60",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-700",
    dot: "bg-gray-400 dark:bg-gray-500",
  },
};

// Configuration automatique par code de statut
const statusMap: Record<
  string,
  { label: string; color: ModernBadgeColor; pulse?: boolean }
> = {
  // Demandes d'Achat (DA)
  DRAFT: { label: "Brouillon", color: "slate" },
  SUBMITTED: { label: "En attente validation", color: "warning", pulse: true },
  APPROVED: { label: "Approuvée (Prête)", color: "success" },
  REJECTED: { label: "Refusée", color: "danger" },
  ORDERED: { label: "Commande Émise", color: "primary" },

  // Bons de Commande Fournisseur (PO)
  ISSUED: { label: "Envoyée Fournisseur", color: "primary", pulse: true },
  PARTIALLY_RECEIVED: { label: "Partiellement Reçue", color: "warning" },
  COMPLETED: { label: "Réception Soldée", color: "success" },
  CANCELLED: { label: "Annulée", color: "danger" },

  // Santé du Stock
  IN_STOCK: { label: "Stock Conforme", color: "success" },
  LOW_STOCK: { label: "Seuil d'Alerte", color: "warning", pulse: true },
  OUT_OF_STOCK: { label: "Rupture de Stock", color: "danger", pulse: true },

  // Alertes
  ACTIVE: { label: "Alerte Active", color: "danger", pulse: true },
  RESOLVED: { label: "Régularisée", color: "success" },
  CRITICAL: { label: "Rupture Totale (0 PCS)", color: "danger", pulse: true },
  HIGH: { label: "Stock Critique", color: "warning" },
  MEDIUM: { label: "Seuil Atteint", color: "primary" },

  // Mouvements de stock
  GOODS_RECEIPT_PO: { label: "Réception Quai (101)", color: "success" },
  SCRAP_DAMAGED: { label: "Casse / Rebut (551)", color: "danger" },
  INTERNAL_CONSUMPTION: { label: "Sortie Atelier (201)", color: "warning" },
  INITIAL_STOCK: { label: "Inventaire Initial (561)", color: "primary" },
  MANUAL_ADJUSTMENT: { label: "Régularisation", color: "slate" },

  // Général
  ACTIVE_FLAG: { label: "Actif", color: "success" },
  INACTIVE_FLAG: { label: "Inactif", color: "slate" },
  PREFERRED: { label: "Fournisseur Privilégié", color: "primary" },
};

export const ModernStatusBadge: React.FC<ModernStatusBadgeProps> = ({
  status,
  label,
  color,
  dotPulse,
  fixedWidth = true,
  className = "",
}) => {
  const config = status ? statusMap[status] : undefined;

  const resolvedColor: ModernBadgeColor = color || config?.color || "slate";
  const resolvedLabel: string = label || config?.label || status || "—";
  const resolvedPulse: boolean = dotPulse !== undefined ? dotPulse : Boolean(config?.pulse);

  const style = colorStyles[resolvedColor];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border tracking-wide whitespace-nowrap shadow-xs transition-all ${
        fixedWidth ? "min-w-[130px] justify-center text-center" : ""
      } ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
        {resolvedPulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${style.dot}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      <span>{resolvedLabel}</span>
    </span>
  );
};
