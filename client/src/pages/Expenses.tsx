import { useMemo, useState } from "react";
import ExpenseCard from "../components/ExpenseCard";
import { Expense } from "../types";

const initialExpenses: Expense[] = [
  { id: "1", title: "Cloud service", amount: 120.0, category: "Hosting", date: "2026-06-02" },
  { id: "2", title: "Team lunch", amount: 95.0, category: "Food", date: "2026-06-04" },
  { id: "3", title: "Conference ticket", amount: 340.0, category: "Training", date: "2026-06-06" },
];

const Expenses = () => {
  const [query, setQuery] = useState("");

  const filteredExpenses = useMemo(
    () =>
      initialExpenses.filter((expense) =>
        expense.title.toLowerCase().includes(query.toLowerCase()) ||
        expense.category.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-brand-50 p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Expenses</h2>
            <p className="mt-2 text-slate-600">Track all of your expense records in one place.</p>
          </div>
          <input
            aria-label="Search expenses"
            placeholder="Search expenses"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-80"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredExpenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="rounded-3xl bg-brand-50 p-8 text-slate-600 shadow-soft">
          No expenses match your search.
        </div>
      )}
    </section>
  );
};

export default Expenses;
