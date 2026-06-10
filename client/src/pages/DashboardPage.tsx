// feat: dashboard analytics page with charts and key summary cards
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useSummary } from "../hooks/useSummary";
import type { Transaction } from "../types";

const cardDefinitions = [
  {
    title: "Total balance",
    description: "Combined cash flow",
    icon: "💼",
    key: "balance",
  },
  {
    title: "Total income",
    description: "Money received",
    icon: "⬆️",
    key: "income",
  },
  {
    title: "Total expenses",
    description: "Money spent",
    icon: "⬇️",
    key: "expenses",
  },
  {
    title: "Transactions this month",
    description: "Recent activity",
    icon: "🗓️",
    key: "count",
  },
] as const;

const renderValue = (summary: NonNullable<ReturnType<typeof useSummary>["data"]>, key: string) => {
  switch (key) {
    case "balance":
      return Math.abs(summary.balance).toLocaleString("en-US", { style: "currency", currency: "USD" });
    case "income":
      return summary.totalIncome.toLocaleString("en-US", { style: "currency", currency: "USD" });
    case "expenses":
      return summary.totalExpenses.toLocaleString("en-US", { style: "currency", currency: "USD" });
    case "count":
      return summary.transactionsThisMonth ?? summary.recentTransactions?.length ?? 0;
    default:
      return "—";
  }
};

interface ChartPayloadItem {
  name?: string;
  value?: number;
  payload?: { percentage?: number };
}

interface DashboardTooltipProps {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: string;
}

const dashboardTooltip = ({ active, payload, label }: DashboardTooltipProps): JSX.Element | null => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-soft">
      <p className="font-semibold text-slate-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-2 text-slate-600">
          <span className="font-semibold text-slate-900">{entry.name}</span>: {entry.value?.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </p>
      ))}
    </div>
  );
};

interface DonutTooltipProps {
  active?: boolean;
  payload?: ChartPayloadItem[];
}

const donutTooltip = ({ active, payload }: DonutTooltipProps): JSX.Element | null => {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-soft">
      <p className="font-semibold text-slate-900">{entry.name}</p>
      <p className="mt-2 text-slate-600">
        Amount: {entry.value ? entry.value.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "-"}
      </p>
      <p className="text-slate-500">
        Share: {entry.payload?.percentage != null ? entry.payload.percentage.toFixed(1) : 0}%
      </p>
    </div>
  );
};

const buildChartData = (months: { month: string; income: number; expenses: number }[]) =>
  months.map((item) => ({ month: item.month, Income: item.income, Expense: item.expenses }));

const DashboardPage = (): JSX.Element => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useSummary();

  const summary =
    data ??
    ({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      byCategory: [],
      monthlyTotals: [],
      recentTransactions: [],
    } as const);

  const totals = summary.monthlyTotals ?? [];
  const donutData = summary.byCategory.map((item) => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color,
    percentage: item.percentage,
  }));
  const recentTransactions = summary.recentTransactions ?? [];

  if (isLoading) {
    return (
      <section className="space-y-8">
        <div className="rounded-[32px] bg-slate-900/60 p-8 shadow-soft">
          <div className="h-8 w-56 rounded-2xl bg-slate-700/60 animate-pulse" />
          <div className="mt-4 h-5 w-96 rounded-2xl bg-slate-700/60 animate-pulse" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl bg-slate-800/70 p-6 shadow-sm animate-pulse" />
              ))}
            </div>
            <div className="h-[360px] rounded-[32px] bg-slate-800/70 shadow-sm animate-pulse" />
          </div>

          <div className="space-y-6">
            <div className="h-[360px] rounded-[32px] bg-slate-800/70 shadow-sm animate-pulse" />
            <div className="h-[240px] rounded-[32px] bg-slate-800/70 shadow-sm animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6 rounded-[32px] bg-white p-10 shadow-soft">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">Dashboard error</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">Unable to load analytics</h2>
          <p className="mt-3 text-sm text-slate-500">Something went wrong while loading your summary. Please try again.</p>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={refetch}
            className="rounded-3xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 bg-[#f8fafc] p-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg transition-all duration-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Analytics dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Your financial snapshot</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Stay on top of your cash flow, categories, and latest transactions in one modern view.</p>
            {user?.role === "ADMIN" ? (
              <div className="mt-4 rounded-3xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm">
                You are signed in as an administrator. Use the admin navigation to manage users and categories.
              </div>
            ) : null}
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white">💡</span>
            Live financial overview
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {cardDefinitions.map((card) => {
          const value = renderValue(summary, card.key);
          const gradientClass =
            card.key === "balance"
              ? "from-indigo-500 to-violet-600"
              : card.key === "income"
              ? "from-emerald-400 to-green-500"
              : card.key === "expenses"
              ? "from-rose-400 to-red-500"
              : "from-amber-400 to-orange-500";

          return (
            <article key={card.key} className={`group overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass} p-6 shadow-lg shadow-slate-300/10 transition-all duration-200 hover:-translate-y-1`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/80">{card.title}</p>
                  <p className="mt-5 text-3xl font-semibold text-white">{value}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-white shadow-inner">
                  <span className="text-xl">{card.icon}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/80">{card.description}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-lg transition-all duration-200 overflow-hidden min-h-0 h-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Income vs Expenses</h3>
              <p className="mt-2 text-sm text-slate-500">Monthly comparison of your cash flow.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">Updated weekly</div>
          </div>
          <div className="mt-8 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildChartData(totals)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip content={dashboardTooltip} />
                <Bar dataKey="Income" fill="#6366f1" radius={[12, 12, 0, 0]} />
                <Bar dataKey="Expense" fill="#ec4899" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg transition-all duration-200">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Expenses by category</h3>
            <p className="mt-2 text-sm text-slate-500">A visual summary of spending across your categories.</p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <div className="w-full lg:w-72 overflow-hidden">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {donutData.map((slice) => (
                  <div key={slice.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                      <span className="text-xs font-medium text-slate-900">{slice.name}</span>
                    </div>
                    <span className="text-xs text-slate-700">{slice.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-lg transition-all duration-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Recent transactions</h3>
            <p className="mt-2 text-sm text-slate-500">Latest activity from your account.</p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-8 text-center text-sm text-slate-500">No recent transactions available.</div>
          ) : (
            recentTransactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-3xl text-lg text-white"
                    style={{ backgroundColor: transaction.category.color }}
                  >
                    {transaction.category.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{transaction.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{transaction.date}</p>
                  </div>
                </div>
                <p className={`text-lg font-semibold ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>
                  {transaction.type === "INCOME" ? "+" : "-"}${transaction.amount.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
