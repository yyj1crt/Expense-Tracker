import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ExpenseCard from "../components/ExpenseCard";
import type { Expense } from "../types";

const chartData = [
  { name: "Jan", total: 4200 },
  { name: "Feb", total: 3800 },
  { name: "Mar", total: 4600 },
  { name: "Apr", total: 5200 },
  { name: "May", total: 6100 },
  { name: "Jun", total: 5800 },
];

const recentExpenses: Expense[] = [
  { id: "1", title: "Software subscription", category: "Tools", amount: 189.99, date: "2026-06-04" },
  { id: "2", title: "Client dinner", category: "Meals", amount: 142.5, date: "2026-06-02" },
  { id: "3", title: "Marketing ads", category: "Growth", amount: 320.0, date: "2026-06-01" },
];

const DashboardPage = () => {
  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">Overview</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Professional insights</h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500">Review your cashflow, account status, and top categories in one clean dashboard.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Monthly performance</h3>
              <p className="mt-2 text-sm text-slate-500">Income and expense trends with smooth, professional styling.</p>
            </div>
            <div className="rounded-3xl bg-indigo-50 px-4 py-2 text-indigo-700">+12.4% growth</div>
          </div>

          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#7c3aed" fill="url(#chartGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-8 shadow-soft">
            <h3 className="text-xl font-semibold text-slate-900">Key metrics</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Total income</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">$12,760</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Total expenses</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">$7,180</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
            <h3 className="text-xl font-semibold">Security status</h3>
            <p className="mt-4 text-slate-300">Your account is protected with secure sessions and token-based authentication.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Recent activity</h3>
            <p className="text-sm text-slate-500">Latest expense entries from your SpendWise profile.</p>
          </div>
          <button className="rounded-3xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400">
            Add transaction
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {recentExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
