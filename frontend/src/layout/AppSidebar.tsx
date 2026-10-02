import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/features/auth/domain/types";
import { useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "../utils";
import { StockPilotLogo } from "@/components/common/StockPilotLogo";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  AlertTriangle,
  History,
  MoreHorizontal,
  ShieldCheck,
  Briefcase,
  FileSpreadsheet,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  roles?: Role[];
};

const masterDataItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    name: "Tableau de Bord",
    path: "/",
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    name: "Fournisseurs",
    path: "/suppliers",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: <Boxes className="h-5 w-5" />,
    name: "Catalogue Articles",
    path: "/products",
  },
  {
    icon: <Package className="h-5 w-5" />,
    name: "Stock & Magasin",
    path: "/inventory",
  },
];

const procurementItems: NavItem[] = [
  {
    icon: <FileText className="h-5 w-5" />,
    name: "Demandes d'Achat",
    path: "/requisitions",
    roles: ["ADMIN", "MANAGER", "USER"],
  },
  {
    icon: <FileSpreadsheet className="h-5 w-5" />,
    name: "Fiches Info Achat (PIR)",
    path: "/purchasing-info-records",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    name: "Commandes Fournisseurs",
    path: "/orders",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: <Truck className="h-5 w-5" />,
    name: "Réceptions Marchandises",
    path: "/goods-receipt",
    roles: ["ADMIN", "MANAGER", "USER"],
  },
];

const auditItems: NavItem[] = [
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    name: "Alertes de Stock",
    path: "/alerts",
  },
  {
    icon: <History className="h-5 w-5" />,
    name: "Historique Mouvements",
    path: "/movements",
  },
];

const ROLE_BADGE_META: Record<
  Role,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  ADMIN: {
    label: "Espace Administrateur",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  },
  MANAGER: {
    label: "Espace Achats & Appro.",
    icon: <Briefcase className="w-3.5 h-3.5" />,
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  USER: {
    label: "Espace Magasinier Stock",
    icon: <Package className="w-3.5 h-3.5" />,
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
};

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const roleMeta =
    user?.role && ROLE_BADGE_META[user.role]
      ? ROLE_BADGE_META[user.role]
      : ROLE_BADGE_META.ADMIN;

  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobileOpen, setIsMobileOpen]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const filterByRole = (items: NavItem[]) => {
    return items.filter((item) => !item.roles || hasRole(...item.roles));
  };

  const renderNavSection = (items: NavItem[], sectionTitle: string) => {
    const visibleItems = filterByRole(items);
    if (visibleItems.length === 0) return null;

    return (
      <div>
        <h2
          className={`mb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider ${
            !isExpanded && !isHovered ? "xl:text-center" : "text-left"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            sectionTitle
          ) : (
            <MoreHorizontal className="mx-auto h-4 w-4" />
          )}
        </h2>
        <ul className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-500 text-white font-semibold shadow-sm shadow-brand-500/20 dark:bg-brand-500 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60",
                    !isExpanded && !isHovered
                      ? "xl:justify-center"
                      : "xl:justify-start"
                  )}
                  title={!isExpanded && !isHovered ? item.name : undefined}
                >
                  <span
                    className={cn(
                      "shrink-0 transition-transform duration-200 group-hover:scale-105",
                      active
                        ? "text-white"
                        : "text-gray-500 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400"
                    )}
                  >
                    {item.icon}
                  </span>

                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {item.badge && (isExpanded || isHovered || isMobileOpen) && (
                    <span className="ms-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-s-0 top-0 z-50 flex h-screen flex-col border-e border-gray-200 bg-white px-4 text-gray-900 transition-all duration-300 ease-in-out xl:translate-x-0 dark:border-gray-800 dark:bg-gray-900",
        isExpanded || isMobileOpen ? "w-72" : isHovered ? "w-72" : "w-20",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex flex-col py-5 border-b border-gray-100 dark:border-gray-800",
          !isExpanded && !isHovered ? "xl:items-center" : "items-start"
        )}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <StockPilotLogo size="md" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="block text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
              Stock<span className="text-brand-500">Pilot</span>
            </span>
          )}
        </Link>

        {/* Badge rôle contextuel */}
        {(isExpanded || isHovered || isMobileOpen) && user && (
          <div className="mt-3 w-full">
            <div
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold",
                roleMeta.badgeClass
              )}
            >
              {roleMeta.icon}
              <span className="truncate">{roleMeta.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sections filtrées par rôle */}
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto py-5 space-y-6">
        {renderNavSection(masterDataItems, "Catalogue & Stocks")}
        {renderNavSection(procurementItems, "Achats & Commandes")}
        {renderNavSection(auditItems, "Suivi & Traçabilité")}
      </div>
    </aside>
  );
}
