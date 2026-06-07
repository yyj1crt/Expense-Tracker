import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import type { ApiResponse, Transaction } from "../types";

interface TransactionFilters {
  type: "ALL" | "INCOME" | "EXPENSE";
  categoryId: number | null;
  startDate: string;
  endDate: string;
  query: string;
}

interface TransactionPageResponse {
  items: Transaction[];
  total: number;
}

export const useTransactions = (pageSize = 10) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "ALL",
    categoryId: null,
    startDate: "",
    endDate: "",
    query: "",
  });
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.type !== "ALL") {
        params.append("type", filters.type);
      }

      if (filters.categoryId) {
        params.append("categoryId", String(filters.categoryId));
      }

      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }

      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      if (filters.query.trim()) {
        params.append("search", filters.query.trim());
      }

      params.append("page", String(page));
      params.append("limit", String(pageSize));
      params.append("sortBy", sortBy);
      params.append("order", sortOrder);

      const response = await api.get<ApiResponse<TransactionPageResponse>>(
        `/transactions?${params.toString()}`
      );

      setTransactions(response.data.data.items ?? []);
      setTotal(response.data.data.total ?? response.data.data.items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const setFilterType = useCallback((type: "ALL" | "INCOME" | "EXPENSE") => {
    setPage(1);
    setFilters((current) => ({ ...current, type }));
  }, []);

  const setFilterCategory = useCallback((categoryId: number | null) => {
    setPage(1);
    setFilters((current) => ({ ...current, categoryId }));
  }, []);

  const setFilterStartDate = useCallback((startDate: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, startDate }));
  }, []);

  const setFilterEndDate = useCallback((endDate: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, endDate }));
  }, []);

  const setFilterQuery = useCallback((query: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, query }));
  }, []);

  const clearFilters = useCallback(() => {
    setPage(1);
    setFilters({
      type: "ALL",
      categoryId: null,
      startDate: "",
      endDate: "",
      query: "",
    });
  }, []);

  const toggleSort = useCallback(
    (field: "date" | "amount") => {
      setPage(1);
      setSortOrder((currentOrder) =>
        sortBy === field ? (currentOrder === "asc" ? "desc" : "asc") : "desc"
      );
      setSortBy(field);
    },
    [sortBy]
  );

  return {
    transactions,
    total,
    page,
    totalPages,
    filters,
    sortBy,
    sortOrder,
    isLoading,
    error,
    refetch: fetchTransactions,
    setPage,
    setFilterType,
    setFilterCategory,
    setFilterStartDate,
    setFilterEndDate,
    setFilterQuery,
    clearFilters,
    toggleSort,
  };
};
