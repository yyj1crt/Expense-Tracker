import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import type { Category } from "../types";

let cachedCategories: Category[] | null = null;

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? []);
  const [isLoading, setIsLoading] = useState(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (cachedCategories) {
      setCategories(cachedCategories);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: Category[] }>("/categories");
      cachedCategories = response.data.data;
      setCategories(cachedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
};
