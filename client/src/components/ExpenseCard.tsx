import type { Expense } from "../types";

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{expense.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{expense.category}</p>
        </div>
        <div className="rounded-full bg-brand-100 px-4 py-2 text-brand-900">
          {expense.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-500">{expense.date}</div>
    </div>
  );
};

export default ExpenseCard;
