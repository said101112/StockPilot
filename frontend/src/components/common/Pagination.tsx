import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { PaginationResult } from "@/hooks/usePagination";

export interface PaginationProps {
  pagination?: PaginationResult<unknown>;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage: explicitCurrentPage,
  totalPages: explicitTotalPages,
  totalItems: explicitTotalItems,
  startIndex: explicitStartIndex,
  endIndex: explicitEndIndex,
  pageSize: explicitPageSize,
  onPageChange: explicitOnPageChange,
  onPageSizeChange: explicitOnPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = "",
}) => {
  const currentPage = pagination ? pagination.currentPage : (explicitCurrentPage ?? 1);
  const totalPages = pagination ? pagination.totalPages : (explicitTotalPages ?? 1);
  const totalItems = pagination ? pagination.totalItems : (explicitTotalItems ?? 0);
  const startIndex = pagination ? pagination.startIndex : (explicitStartIndex ?? 0);
  const endIndex = pagination ? pagination.endIndex : (explicitEndIndex ?? 0);
  const pageSize = pagination ? pagination.pageSize : (explicitPageSize ?? 10);
  const onPageChange = pagination ? pagination.goToPage : (explicitOnPageChange ?? (() => {}));
  const onPageSizeChange = pagination ? pagination.changePageSize : explicitOnPageSizeChange;

  if (totalItems === 0) return null;

  // Calcul des numéros de pages à afficher avec ellipses intelligentes
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {/* Informations de comptage & Sélecteur de taille */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Affichage de <strong className="font-semibold text-gray-900 dark:text-white font-mono">{startIndex}</strong> à{" "}
          <strong className="font-semibold text-gray-900 dark:text-white font-mono">{endIndex}</strong> sur{" "}
          <strong className="font-semibold text-gray-900 dark:text-white font-mono">{totalItems}</strong> résultats
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Lignes / page :</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-gray-50/70 px-2 py-1 text-xs font-semibold text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contrôles de navigation */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* Première page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Première page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Page précédente */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Page précédente"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-semibold font-mono transition-colors ${
                  currentPage === p
                    ? "bg-brand-600 text-white shadow-xs dark:bg-brand-500"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {p}
              </button>
            ) : (
              <span
                key={idx}
                className="flex h-8 w-6 items-center justify-center text-xs text-gray-400 font-mono"
              >
                {p}
              </span>
            )
          )}
        </div>

        {/* Page suivante */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Page suivante"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dernière page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Dernière page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
