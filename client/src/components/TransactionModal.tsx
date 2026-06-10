// feat: transaction modal with validation, edit/create support, and secure form handling
import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../services/api";
import type { Category, Transaction } from "../types";

export const transactionSchema = z.object({
  title: z.string().min(1, "Title is required."),
  amount: z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().positive("Amount must be a positive number")),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required."),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  categories: Category[];
  isLoadingCategories: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const TransactionModal = ({ categories, isLoadingCategories, transaction, onClose, onSuccess, onError }: TransactionModalProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: transaction?.title ?? "",
      amount: transaction?.amount ?? "",
      type: transaction?.type ?? "EXPENSE",
      categoryId: transaction?.category.id.toString() ?? "",
      date: transaction?.date?.split("T")[0]?.split("T")[0] ?? new Date().toISOString().split("T")[0],
      note: transaction?.note ?? "",
    },
  });

  const handleValidationError = (formErrors: FieldErrors<TransactionFormValues>) => {
    const errorMessages = [formErrors.amount, formErrors.title, formErrors.categoryId, formErrors.date]
      .filter(Boolean)
      .map((error) => error?.message)
      .filter(Boolean) as string[];

    if (errorMessages.length > 0) {
      const message = errorMessages[0];
      setError(message);
      onError(message);
    }
  };

  useEffect(() => {
    reset({
      title: transaction?.title ?? "",
      amount: transaction?.amount ?? "",
      type: transaction?.type ?? "EXPENSE",
      categoryId: transaction?.category.id.toString() ?? "",
      date: transaction?.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      note: transaction?.note ?? "",
    });
  }, [transaction, reset]);

  const typeValue = watch("type");
  const [error, setError] = useState<string | null>(null);

  const submitHandler = async (values: TransactionFormValues) => {
    setError(null);
    const amountValue = Number(values.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      const message = "Amount must be a positive number";
      setError(message);
      onError(message);
      return;
    }

    try {
      const payload = {
        title: values.title,
        amount: amountValue,
        type: values.type,
        categoryId: Number(values.categoryId),
        date: new Date(values.date).toISOString(),
        note: values.note || "",
      };

      if (transaction) {
        await api.put(`/api/transactions/${transaction.id}`, payload);
        onSuccess("Transaction updated successfully.");
      } else {
        await api.post("/api/transactions", payload);
        onSuccess("Transaction created successfully.");
      }
    } catch (err) {
      console.error("Transaction save error:", err);
      console.error("Response:", err?.response?.data);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save transaction. Please try again.";
      setError(errorMessage);
      onError(errorMessage);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl ring-1 ring-slate-900/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="transaction-modal-title" className="text-2xl font-semibold text-white">
              {transaction ? "Edit transaction" : "Add transaction"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">Submit the details to save the transaction.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900/90 p-3 text-slate-300 transition hover:border-white/20 hover:bg-slate-800"
            aria-label="Close transaction modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler, handleValidationError)} className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200" htmlFor="title">
              Title
              <input
                id="title"
                type="text"
                {...register("title")}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200" htmlFor="amount">
              Amount
              <input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
          </div>

          {errors.title && <p className="text-sm text-rose-400">{errors.title.message}</p>}
          {errors.amount && <p className="text-sm text-rose-400">{errors.amount.message}</p>}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Type</p>
              <div className="flex gap-3">
                {(["INCOME", "EXPENSE"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValue("type", option)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      typeValue === option
                        ? option === "INCOME"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-rose-500 text-white"
                        : "border border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {option === "INCOME" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-200" htmlFor="categoryId">
              Category
              <select
                id="categoryId"
                {...register("categoryId")}
                required
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">Choose a category</option>
                {(isLoadingCategories || categories.length === 0) ? (
                  <option value="" disabled>
                    Loading categories...
                  </option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>
          {errors.categoryId && <p className="text-sm text-rose-400">{errors.categoryId.message}</p>}

          {error && (
            <div className="rounded-2xl bg-rose-900/20 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200" htmlFor="date">
              Date
              <input
                id="date"
                type="date"
                {...register("date")}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200" htmlFor="note">
              Note
              <textarea
                id="note"
                rows={4}
                {...register("note")}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : transaction ? "Save changes" : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
