import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Search,
  Factory,
  Wrench,
  Package,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import {
  PRODUCT_TAXONOMY,
  PRODUCT_TAXONOMY_GROUPS,
  getCategoryInfo,
  type ProductCategoryInfo,
} from "../domain/taxonomy";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  "Production & Fabrication": <Factory className="h-3.5 w-3.5 text-blue-500" />,
  "Maintenance & Exploitation (MRO)": <Wrench className="h-3.5 w-3.5 text-amber-500" />,
  "Logistique & Conditionnement": <Package className="h-3.5 w-3.5 text-teal-500" />,
  "Sécurité & Services Généraux": <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />,
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  RAW_MATERIAL: "bg-blue-500",
  SEMI_FINISHED: "bg-amber-500",
  FINISHED_GOOD: "bg-emerald-500",
  SPARE_PART: "bg-rose-500",
  EQUIPMENT: "bg-purple-500",
  CHEMICALS: "bg-orange-500",
  PACKAGING: "bg-teal-500",
  CONSUMABLE: "bg-slate-500",
  SAFETY_EQUIPMENT: "bg-green-600",
  OFFICE_SUPPLY: "bg-indigo-500",
  SERVICE: "bg-fuchsia-500",
};

export default function CategorySelect({ value, onChange, className = "", id }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = getCategoryInfo(value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Filter categories based on search query
  const query = search.toLowerCase().trim();
  const filteredCategories = PRODUCT_TAXONOMY.filter(
    (c) =>
      c.label.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.group.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
  );

  const handleSelect = (categoryCode: string) => {
    onChange(categoryCode);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm shadow-sm transition-all duration-200 dark:bg-gray-800 ${
          isOpen
            ? "border-brand-500 ring-4 ring-brand-500/10 dark:border-brand-400"
            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              CATEGORY_DOT_COLORS[selectedCategory.code] || "bg-gray-400"
            }`}
          />
          <span className="truncate font-semibold text-gray-900 dark:text-white">
            {selectedCategory.label}
          </span>
          <span className="hidden sm:inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700/60 dark:text-gray-300">
            {selectedCategory.group}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 ${
            isOpen ? "rotate-180 text-brand-600 dark:text-brand-400" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-md transition-all animate-in fade-in-0 zoom-in-95 duration-150 dark:border-gray-800 dark:bg-gray-900/95">
          {/* Quick Search Header */}
          <div className="border-b border-gray-100 bg-gray-50/80 p-2.5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher une catégorie (ex: métaux, IT, EPI)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-7 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Grouped Category Options */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-3">
            {filteredCategories.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                <Tag className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600 mb-1" />
                Aucune catégorie trouvée pour &ldquo;{search}&rdquo;
              </div>
            ) : (
              PRODUCT_TAXONOMY_GROUPS.map((group) => {
                const groupItems = filteredCategories.filter((c) => c.group === group);
                if (groupItems.length === 0) return null;

                return (
                  <div key={group} className="space-y-1">
                    {/* Group Header */}
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {GROUP_ICONS[group] || <Tag className="h-3 w-3" />}
                      <span>{group}</span>
                    </div>

                    {/* Category Items */}
                    <div className="space-y-0.5">
                      {groupItems.map((c: ProductCategoryInfo) => {
                        const isSelected = c.code === value;
                        const dotColor = CATEGORY_DOT_COLORS[c.code] || "bg-gray-400";

                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelect(c.code)}
                            className={`group/item flex w-full items-start justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-all ${
                              isSelected
                                ? "bg-brand-50/80 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium"
                                : "text-gray-700 hover:bg-gray-100/70 dark:text-gray-200 dark:hover:bg-gray-800/60"
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-transform group-hover/item:scale-125 ${dotColor}`}
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold leading-snug">
                                  {c.label}
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 leading-tight">
                                  {c.description}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400 self-center" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-1.5 text-[11px] text-gray-400 dark:border-gray-800 dark:bg-gray-800/30 flex items-center justify-between">
            <span>{PRODUCT_TAXONOMY.length} catégories répertoriées</span>
            <span className="italic">Standard SAP MM / StockPilot ERP</span>
          </div>
        </div>
      )}
    </div>
  );
}
