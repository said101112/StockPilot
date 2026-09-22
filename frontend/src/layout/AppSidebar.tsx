import { useSidebar } from "@/context/SidebarContext";
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
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
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
    name: "Demandes d'Achat (DA)",
    path: "/requisitions",
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    name: "Commandes d'Achat (PO)",
    path: "/orders",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    name: "Réceptions (MIGO)",
    path: "/goods-receipt",
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
    name: "Audit des Mouvements",
    path: "/movements",
  },
];

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const location = useLocation();

  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobileOpen, setIsMobileOpen]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  const renderNavSection = (items: NavItem[], sectionTitle: string) => (
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
        {items.map((item) => {
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
                    : "xl:justify-start",
                )}
                title={!isExpanded && !isHovered ? item.name : undefined}
              >
                <span
                  className={cn(
                    "shrink-0 transition-transform duration-200 group-hover:scale-105",
                    active
                      ? "text-white"
                      : "text-gray-500 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400",
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

  return (
    <aside
      className={cn(
        "fixed inset-s-0 top-0 z-50 flex h-screen flex-col border-e border-gray-200 bg-white px-4 text-gray-900 transition-all duration-300 ease-in-out xl:translate-x-0 dark:border-gray-800 dark:bg-gray-900",
        isExpanded || isMobileOpen ? "w-72" : isHovered ? "w-72" : "w-20",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex py-5 border-b border-gray-100 dark:border-gray-800",
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start",
        )}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <StockPilotLogo size="md" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="overflow-hidden">
              <span className="block text-lg font-black tracking-tight text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                Stock<span className="text-brand-500">Pilot</span>
              </span>
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-sky-400">
                Aerospace & Supply Chain ERP
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto py-5 space-y-6">
        {renderNavSection(masterDataItems, "Référentiel & Stocks")}
        {renderNavSection(procurementItems, "Cycle Achats (P2P)")}
        {renderNavSection(auditItems, "Contrôle & Audit")}
      </div>
    </aside>
  );
}
