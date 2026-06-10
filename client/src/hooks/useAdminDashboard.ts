import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import type { ApiResponse, AdminDashboardSummary } from "../types";

export const useAdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<AdminDashboardSummary>>("/api/admin/dashboard");
      setData(response.data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load admin dashboard.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
};
