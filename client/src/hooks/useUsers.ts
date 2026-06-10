import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import type { ApiResponse, AdminUser } from "../types";

export const useUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<AdminUser[]>>("/api/admin/users");
      setUsers(response.data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load users.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(
    async (userId: number) => {
      await api.delete(`/api/admin/users/${userId}`);
      await fetchUsers();
    },
    [fetchUsers]
  );

  return { users, isLoading, error, refetch: fetchUsers, deleteUser };
};
