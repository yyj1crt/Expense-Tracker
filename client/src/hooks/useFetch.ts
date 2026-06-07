import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

export const useFetch = <T = unknown>(url: string, config?: AxiosRequestConfig) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<T>(url, config)
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message || "Unable to fetch data"))
      .finally(() => setLoading(false));
  }, [url, config]);

  return { data, loading, error };
};
