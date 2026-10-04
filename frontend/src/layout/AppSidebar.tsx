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
  FileSpreadsheet,
  Users,
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
    icon: <LayoutDashboard className="h-4.5 w-4.5" />,
    name: "Tableau de Bord",
    path: "/",
  },
  {
    icon: <Users className="h-4.5 w-4.5" />,
    name: "Gestion Utilisateurs",
    path: "/users",
    roles: ["ADMIN"],
  },
  {
    icon: <Building2 className="h-4.5 w-4.5" />,
    name: "Fournisseurs",
    path: "/suppliers",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: <Boxes className="h-4.5 w-4.5" />,
    name: "Catalogue Articles",
    path: "/products",
  },
  {
    icon: <Package className="h-4.5 w-4.5" />,
    name: "Stock & Magasin",
    path: "/inventory",
  },
];

const procurementItems: NavItem[] = [
  {
    icon: <FileText className="h-4.5 w-4.5" />,
    name: "Demandes d'Achat",
    path: "/requisitions",
    roles: ["ADMIN", "MANAGER", "USER"],
  },
  {
    icon: <FileSpreadsheet className="h-4.5 w-4.5" />,
    name: "Fiches Info Achat (PIR)",
    path: "/purchasing-info-records",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: <ShoppingCart className="h-4.5 w-4.5" />,
    name: "Commandes Fournisseurs",
    path: "/orders",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: <Truck className="h-4.5 w-4.5" />,
    name: "Réceptions Marchandises",
    path: "/goods-receipt",
    roles: ["ADMIN", "MANAGER", "USER"],
  },
];

const auditItems: NavItem[] = [
  {
    icon: <AlertTriangle className="h-4.5 w-4.5" />,
    name: "Alertes de Stock",
    path: "/alerts",
  },
  {
    icon: <History className="h-4.5 w-4.5" />,
    name: "Historique Mouvements",
    path: "/movements",
  },
];

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const { hasRole } = useAuth();
  const location = useLocation();

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
          className={`mb-1 px-2.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${
            !isExpanded && !isHovered ? "xl:text-center" : "text-left"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            sectionTitle
          ) : (
            <MoreHorizontal className="mx-auto h-3.5 w-3.5" />
          )}
        </h2>
        <ul className="flex flex-col gap-0.5">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-brand-500 text-white font-semibold shadow-xs shadow-brand-500/25 dark:bg-brand-500 dark:text-white"
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
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-e border-gray-200 bg-white px-3.5 text-gray-900 transition-all duration-300 ease-in-out xl:translate-x-0 dark:border-gray-800 dark:bg-gray-900",
        isExpanded || isMobileOpen ? "w-72" : isHovered ? "w-72" : "w-20",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-gray-100 dark:border-gray-800 px-2",
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
        )}
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <StockPilotLogo size="sm" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="block text-lg font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
              Stock<span className="text-brand-500">Pilot</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Sections filtrées par rôle */}
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto py-3 space-y-3.5">
        {renderNavSection(masterDataItems, "Catalogue & Référentiel")}
        {renderNavSection(procurementItems, "Achats & Commandes")}
        {renderNavSection(auditItems, "Suivi & Traçabilité")}
      </div>
    </aside>
  );
}
