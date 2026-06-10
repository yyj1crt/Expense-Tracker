export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
}

export interface MonthlyTotal {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  note?: string;
  category: Category;
  createdAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: CategoryBreakdown[];
  monthlyTotals: MonthlyTotal[];
  recentTransactions?: Transaction[];
  transactionsThisMonth?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
  errors?: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}
