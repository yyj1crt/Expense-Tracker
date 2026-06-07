export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isPositiveAmount = (amount: number): boolean => {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
};

const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
};

export const sanitiseString = (input: string): string => {
  return input
    .trim()
    .replace(/[&<>"'\/]/g, (character) => escapeMap[character] || character);
};
