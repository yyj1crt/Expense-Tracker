import { useEffect, useState } from "react";
import { CalendarDays, Edit3, Plus, Search, Trash2 } from "lucide-react";
import api from "../services/api";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import TransactionModal from "../components/TransactionModal";
import Toast from "../components/ui/Toast";
import type { Transaction } from "../types";

type ToastItem = {
  id: string;
  message: string;
  variant: "success" | "error";
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const sortLabel = (field: "date" | "amount", sortBy: string, sortOrder: string) => {
  if (sortBy !== field) return "none";
  return sortOrder === "asc" ? "ascending" : "descending";
};

// feat: transaction management page with filtering, sorting, and modal CRUD
const TransactionsPage = (): JSX.Element => {
  const {
    transactions,
    total,
    page,
    totalPages,
    filters,
    sortBy,
    sortOrder,
    isLoading,
    error,
    refetch,
    setPage,
    setFilterType,
    setFilterCategory,
    setFilterStartDate,
    setFilterEndDate,
    setFilterQuery,
    clearFilters,
    toggleSort,
  } = useTransactions();

  const { categories, isLoading: categoriesLoading } = useCategories();
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilterQuery(searchInput);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, setFilterQuery]);

  const handleClearFilters = () => {
    setSearchInput("");
    clearFilters();
  };

  const addToast = (message: string, variant: "success" | "error") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, variant }]);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const openAddModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);

    try {
      await api.delete(`/transactions/${deleteTarget.id}`);
      addToast("Transaction deleted successfully.", "success");
      setDeleteTarget(null);
      await refetch();
    } catch {
      addToast("Unable to delete transaction.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderStatus = (type: string) =>
    type === "INCOME"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";

  const offsetStart = Math.min((page - 1) * 10 + 1, total || 1);
  const offsetEnd = Math.min(page * 10, total);

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Transactions</p>
            <h1 className="mt-3 text-3xl font-semibold">Manage your cash flow</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Track, filter, and update entries with a premium workspace layout.</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            <Plus className="h-4 w-4" />
            Add transaction
          </button>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="grid gap-5 xl:grid-cols-[1fr_auto]">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "INCOME", "EXPENSE"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilterType(option)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filters.type === option
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {option === "ALL" ? "All" : option.charAt(0) + option.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="categoryFilter">
                Category
                <select
                  id="categoryFilter"
                  value={filters.categoryId ?? ""}
                  onChange={(event) => setFilterCategory(event.target.value ? Number(event.target.value) : null)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700" htmlFor="searchFilter">
                Search title
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="searchFilter"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search transactions"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-12 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="startDate">
              Start date
              <div className="relative mt-2">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilterStartDate(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-12 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </label>
            <label className="block text-sm font-medium text-slate-700" htmlFor="endDate">
              End date
              <div className="relative mt-2">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilterEndDate(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-12 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-4">
          <p className="text-sm text-slate-500">Showing {offsetStart}-{offsetEnd} of {total} transactions</p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-16 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-slate-700">
            <p className="font-semibold text-rose-700">Unable to load transactions</p>
            <p className="mt-2 text-sm text-slate-500">Please try again or adjust your filters.</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-4 rounded-3xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              Retry
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="grid gap-6 rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-3xl">📄</div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">No transactions yet</h2>
              <p className="mt-2 text-sm text-slate-500">Add your first transaction or clear filters to refresh the list.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[32px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSort("date")}
                        className="inline-flex items-center gap-2 font-semibold"
                        aria-sort={sortLabel("date", sortBy, sortOrder)}
                      >
                        Date
                        <span>{sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-4">Title</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Type</th>
                    <th scope="col" className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort("amount")}
                        className="inline-flex items-center gap-2 font-semibold"
                        aria-sort={sortLabel("amount", sortBy, sortOrder)}
                      >
                        Amount
                        <span>{sortBy === "amount" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{transaction.date}</td>
                      <td className="px-6 py-4">{transaction.title}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                          <span
                            className="grid h-8 w-8 place-items-center rounded-full text-lg text-white"
                            style={{ backgroundColor: transaction.category.color }}
                          >
                            {transaction.category.icon}
                          </span>
                          {transaction.category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${renderStatus(transaction.type)}`}>
                          {transaction.type === "INCOME" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(transaction)}
                            className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(transaction)}
                            className="inline-flex items-center gap-2 rounded-3xl bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TransactionModal
          categories={categories}
          isLoadingCategories={categoriesLoading}
          transaction={selectedTransaction}
          onClose={() => setIsModalOpen(false)}
          onSuccess={async (message) => {
            addToast(message, "success");
            setIsModalOpen(false);
            await refetch();
          }}
          onError={(message) => addToast(message, "error")}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-900">Delete transaction</h2>
            <p className="mt-3 text-sm text-slate-600">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-3xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} variant={toast.variant} message={toast.message} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default TransactionsPage;
