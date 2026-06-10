import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import type { ApiResponse, TransactionSummary } from "../types";

// feat: summary hook for dashboard analytics and live refresh
export const useSummary = (): {
  data: TransactionSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} => {
  const [data, setData] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<TransactionSummary>>("/api/transactions/summary");
      setData(response.data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load summary.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
};
