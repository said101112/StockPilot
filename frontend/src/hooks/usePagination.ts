import { useState, useMemo, useEffect } from "react";

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface PaginationConfig<T> extends PaginationOptions {
  items: T[];
}

export interface PaginationResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedItems: T[];
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changePageSize: (newSize: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePagination<T>(
  itemsOrConfig: T[] | PaginationConfig<T>,
  options?: PaginationOptions
): PaginationResult<T> {
  const isConfigObject = !Array.isArray(itemsOrConfig);
  const items: T[] = isConfigObject ? itemsOrConfig.items : itemsOrConfig;
  const initialPage = (isConfigObject ? itemsOrConfig.initialPage : options?.initialPage) ?? 1;
  const initialPageSize = (isConfigObject ? itemsOrConfig.initialPageSize : options?.initialPageSize) ?? 10;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Réajuster si la page courante dépasse le nombre total de pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Éléments de la page courante (slice virtuel)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(target);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Retour à la première page lors du changement de taille
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
