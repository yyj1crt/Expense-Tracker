import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ExpenseCard from "../components/ExpenseCard";
import { Expense } from "../types";

const chartData = [
  { name: "Jan", total: 2400 },
  { name: "Feb", total: 1800 },
  { name: "Mar", total: 2200 },
  { name: "Apr", total: 2600 },
  { name: "May", total: 3000 },
];

const expenses: Expense[] = [
  { id: "1", title: "Office Supplies", amount: 125.5, category: "Operations", date: "2026-06-01" },
  { id: "2", title: "Travel Refund", amount: 450.0, category: "Travel", date: "2026-06-03" },
  { id: "3", title: "Software License", amount: 280.75, category: "Tools", date: "2026-06-05" },
];

const Dashboard = () => {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-brand-50 p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-2 text-slate-600">A live overview of your latest spending activity.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl bg-brand-50 p-8 shadow-soft">
          <h3 className="mb-5 text-xl font-semibold text-slate-900">Expense trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#7c3aed" fill="url(#gradientTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-brand-50 p-8 shadow-soft">
            <h3 className="text-xl font-semibold text-slate-900">Quick stats</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Monthly budget</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">$8,500</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Expenses this month</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">$4,725</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-brand-950 p-8 text-white shadow-soft">
            <h3 className="text-xl font-semibold">Security & sync</h3>
            <p className="mt-4 text-slate-300">Your expense data is ready for syncing across devices with secure JWT authentication and encrypted password storage.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Recent expenses</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
