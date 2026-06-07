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
import { useSummary } from "../hooks/useSummary";
import type { Transaction } from "../types";

const chartColors = {
  income: "#10b981",
  expense: "#ef4444",
};

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
      return summary.recentTransactions?.length ?? 0;
    default:
      return "—";
  }
};

const renderCardGradient = (key: string) => {
  if (key === "expenses") {
    return "from-red-500/10 via-transparent to-red-100/0";
  }

  if (key === "income") {
    return "from-emerald-500/10 via-transparent to-emerald-100/0";
  }

  if (key === "balance") {
    return "from-indigo-500/10 via-transparent to-violet-100/0";
  }

  return "from-slate-200/50 via-transparent to-slate-100/0";
};

const dashboardTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-soft">
      <p className="font-semibold text-slate-900">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="mt-2 text-slate-600">
          <span className="font-semibold text-slate-900">{entry.name}</span>: {entry.value.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </p>
      ))}
    </div>
  );
};

const donutTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-soft">
      <p className="font-semibold text-slate-900">{entry.name}</p>
      <p className="mt-2 text-slate-600">Amount: {entry.value.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
      <p className="text-slate-500">Share: {entry.payload.percentage.toFixed(1)}%</p>
    </div>
  );
};

const buildChartData = (months: { month: string; income: number; expenses: number }[]) =>
  months.map((item) => ({ month: item.month, Income: item.income, Expense: item.expenses }));

const buildDonutData = (categories: { category: { id: number; name: string; color: string } }[]) =>
  categories.map((item) => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color,
    percentage: item.percentage,
  }));

const getStatusText = (balance: number) => {
  if (balance >= 0) return { label: "Positive", color: "text-emerald-500" };
  return { label: "Negative", color: "text-rose-500" };
};

const DashboardPage = () => {
  const { data, isLoading, error, refetch } = useSummary();

  const totals = data?.monthlyTotals ?? [];
  const donutData = data?.byCategory.map((item) => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color,
    percentage: item.percentage,
  })) ?? [];
  const recentTransactions = data?.recentTransactions ?? [];

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

  const status = getStatusText(data?.balance ?? 0);

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Executive summary</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Analytics dashboard</h2>
          </div>
          <p className="max-w-2xl text-sm text-slate-500">Track your balance, cash flow, and recent activity with a clean professional view.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {cardDefinitions.map((card) => {
          const value = renderValue(data!, card.key);
          return (
            <article
              key={card.key}
              className={`group overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br ${renderCardGradient(card.key)} p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{card.title}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/90 text-2xl shadow-sm text-slate-900">
                  {card.icon}
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-500">{card.description}</p>
              {card.key === "balance" && (
                <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${status.color} bg-slate-100/80`}>{status.label}</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Income vs expenses</h3>
              <p className="mt-2 text-sm text-slate-500">Last 6 months of cash flow performance.</p>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Updated weekly</div>
          </div>

          <div className="mt-8 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildChartData(totals)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip content={dashboardTooltip} />
                <Bar dataKey="Income" fill={chartColors.income} radius={[12, 12, 0, 0]} />
                <Bar dataKey="Expense" fill={chartColors.expense} radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Expenses by category</h3>
            <p className="mt-2 text-sm text-slate-500">A visual summary of your current category mix.</p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <div className="h-72 w-full lg:w-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={108}
                    paddingAngle={4}
                    stroke="transparent"
                    labelLine={false}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={donutTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-3">
              {donutData.map((slice) => (
                <div key={slice.name} className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-sm font-medium text-slate-900">{slice.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{slice.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Recent transactions</h3>
            <p className="mt-2 text-sm text-slate-500">Your latest activity from the last 5 entries.</p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex rounded-3xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            View all
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">No recent transactions available.</div>
          ) : (
            recentTransactions.map((transaction: Transaction) => (
              <div key={transaction.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-3xl text-lg`} style={{ backgroundColor: transaction.category.color }}>
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
