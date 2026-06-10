import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../context/AuthContext";
import type { Transaction } from "../types";

const STORAGE_KEY = "spendwise_budgets";

type Budget = { categoryId: number; limit: number; month: string };

const getCurrentMonth = () => new Date().toISOString().slice(0, 7); // YYYY-MM

const BudgetPage = (): JSX.Element => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [limitValue, setLimitValue] = useState<string>("");
  const [limitError, setLimitError] = useState<string | null>(null);

  const storageKey = `${STORAGE_KEY}_${user?.id ?? "guest"}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed: Budget[] = JSON.parse(stored);
        const sanitized = parsed.map((b) => ({ ...b, limit: Math.max(0, Number(b.limit) || 0) }));
        setBudgets(sanitized);
      } catch (e) {
        console.error("Failed to parse stored budgets", e);
      }
    } else {
      setBudgets([]);
    }

    const fetchTx = async () => {
      try {
        const res = await api.get("/api/transactions?limit=10000");
        setTransactions(res.data.data.transactions || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTx();
  }, []);

  const { categories, isLoading: isLoadingCategories } = useCategories();
  const month = getCurrentMonth();

  const budgetsForMonth = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month]);

  const budgetCategoryIds = useMemo(
    () => new Set(budgetsForMonth.map((b) => b.categoryId)),
    [budgetsForMonth]
  );

  const spentByCategory = useMemo(() => {
    const map = new Map<number, number>();
    transactions
      .filter(
        (t) =>
          t.type === "EXPENSE" &&
          t.date?.slice(0, 7) === month &&
          budgetCategoryIds.has(t.category.id)
      )
      .forEach((t) => {
        const id = t.category.id;
        map.set(id, (map.get(id) || 0) + t.amount);
      });
    return map;
  }, [transactions, month, budgetCategoryIds]);

  const summary = useMemo(() => {
    const totalBudget = budgetsForMonth.reduce((s, b) => s + Math.max(0, b.limit), 0);
    const totalSpent = Array.from(spentByCategory.values()).reduce((s, v) => s + v, 0);
    return { totalBudget, totalSpent, remaining: totalBudget - totalSpent };
  }, [budgetsForMonth, spentByCategory]);

  const openSetBudget = (categoryId?: number) => {
    setSelectedCategory(categoryId ?? null);
    if (categoryId) {
      const existing = budgets.find((b) => b.categoryId === categoryId && b.month === month);
      setLimitValue(existing ? String(existing.limit) : "");
    } else {
      setLimitValue("");
    }
    setLimitError(null);
    setIsModalOpen(true);
  };

  const saveBudget = () => {
    if (!selectedCategory) return;
    const limit = Number(limitValue);
    if (Number.isNaN(limit) || limit < 0) {
      setLimitError("Limit must be a non-negative number");
      return;
    }
    const sanitizedLimit = Math.max(0, limit);
    const newBudgets = budgets.filter((b) => !(b.categoryId === selectedCategory && b.month === month));
    newBudgets.push({ categoryId: selectedCategory, limit: sanitizedLimit, month });
    setBudgets(newBudgets);
    localStorage.setItem(storageKey, JSON.stringify(newBudgets));
    setIsModalOpen(false);
  };

  const deleteBudget = (categoryId: number) => {
    const newBudgets = budgets.filter((b) => !(b.categoryId === categoryId && b.month === month));
    setBudgets(newBudgets);
    localStorage.setItem(storageKey, JSON.stringify(newBudgets));
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Budget Planner</h1>
          <p className="mt-1 text-sm text-slate-500">{new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openSetBudget()} className="rounded-3xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">Set Budget</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">Summary</p>
          <div className="mt-4 text-2xl font-semibold">{summary.totalBudget.toLocaleString(undefined, { style: "currency", currency: "USD" })}</div>
          <p className="mt-2 text-sm">Budgeted</p>
          <div className="mt-4 text-sm">Spent: {summary.totalSpent.toLocaleString(undefined, { style: "currency", currency: "USD" })}</div>
          <div className="mt-1 text-sm">Remaining: {summary.remaining.toLocaleString(undefined, { style: "currency", currency: "USD" })}</div>
        </div>
        <div className="col-span-3 rounded-2xl bg-white p-6 shadow-lg">
          {budgetsForMonth.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">No budgets set yet.</p>
              <button onClick={() => openSetBudget()} className="mt-4 rounded-3xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">Set your first budget</button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgetsForMonth.map((b) => {
                const spent = spentByCategory.get(b.categoryId) || 0;
                const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
                const color = pct < 60 ? "bg-emerald-400" : pct < 85 ? "bg-amber-400" : "bg-rose-400";
                const cat = categories.find((c) => c.id === b.categoryId) ?? { name: "Unknown", icon: "" };
                return (
                  <div key={b.categoryId} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: cat.color }}>
                          <div className="p-2 text-white">{cat.icon}</div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                          <p className="text-xs text-slate-500">Limit: {b.limit.toLocaleString(undefined, { style: "currency", currency: "USD" })}</p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{Math.round(pct)}%</div>
                    </div>
                    <div className="mt-4 h-3 w-full rounded-full bg-slate-100">
                      <div className={`h-3 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <div>{(spent).toLocaleString(undefined, { style: "currency", currency: "USD" })} spent</div>
                      <div>{b.limit.toLocaleString(undefined, { style: "currency", currency: "USD" })} budget</div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button onClick={() => { setSelectedCategory(b.categoryId); setLimitValue(String(b.limit)); setIsModalOpen(true); }} className="rounded-3xl bg-slate-100 px-3 py-1 text-sm">Edit</button>
                      <button onClick={() => deleteBudget(b.categoryId)} className="rounded-3xl border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-700 hover:bg-rose-100">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold">Set Budget</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">Category</label>
              <select
                className="w-full rounded-md border p-2"
                value={selectedCategory ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedCategory(v ? Number(v) : null);
                }}
              >
                <option value="">Select category</option>
                {categories
                  .filter((c) => c.name !== "Salary")
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>

              <label className="block text-sm">Limit amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md border p-2"
                value={limitValue}
                onChange={(e) => {
                  setLimitValue(e.target.value);
                  if (limitError) setLimitError(null);
                }}
                placeholder="0.00"
              />
              {limitError && <div className="mt-1 text-xs text-rose-600">{limitError}</div>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="rounded-3xl border px-4 py-2">Cancel</button>
              <button onClick={saveBudget} className="rounded-3xl bg-indigo-500 px-4 py-2 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BudgetPage;
