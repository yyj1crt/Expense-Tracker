import { useMemo, useState } from "react";
import type { Transaction } from "../types";

const sampleTransactions: Transaction[] = [
  {
    id: 1,
    title: "Invoice payment",
    amount: 2400,
    type: "INCOME",
    date: "2026-06-05",
    category: { id: 1, name: "Revenue", color: "bg-indigo-100", icon: "💼" },
    createdAt: "2026-06-05T10:23:00Z",
  },
  {
    id: 2,
    title: "Office refresh",
    amount: 420,
    type: "EXPENSE",
    date: "2026-06-03",
    category: { id: 2, name: "Operations", color: "bg-violet-100", icon: "🛠️" },
    createdAt: "2026-06-03T14:50:00Z",
  },
  {
    id: 3,
    title: "Client subscription",
    amount: 980,
    type: "INCOME",
    date: "2026-06-01",
    category: { id: 3, name: "Services", color: "bg-indigo-100", icon: "📦" },
    createdAt: "2026-06-01T09:30:00Z",
  },
];

const TransactionsPage = () => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      sampleTransactions.filter((transaction) =>
        `${transaction.title} ${transaction.category.name}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Transactions</h2>
            <p className="mt-2 text-sm text-slate-500">Manage every income and expense entry from one elegant interface.</p>
          </div>
          <input
            type="search"
            aria-label="Search transactions"
            placeholder="Search transactions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 sm:w-80"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="overflow-hidden rounded-[28px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.15em]">Title</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.15em]">Category</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.15em]">Date</th>
                  <th className="px-6 py-4 text-right font-semibold uppercase tracking-[0.15em]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                {filtered.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4">{transaction.title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ${transaction.category.color}`}>
                        <span>{transaction.category.icon}</span>
                        {transaction.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">{transaction.date}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {transaction.type === "INCOME" ? "+" : "-"}${transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-8 shadow-soft">
            <h3 className="text-xl font-semibold text-slate-900">Summary</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">This month</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">$9,420</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Transactions</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{filtered.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
            <h3 className="text-xl font-semibold">Quick actions</h3>
            <p className="mt-4 text-sm text-slate-300">Use the sidebar to switch between dashboards and category controls with a polished admin experience.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransactionsPage;
