export const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const formatDate = (value: string) =>
  new Date(value).toISOString().slice(0, 10);
