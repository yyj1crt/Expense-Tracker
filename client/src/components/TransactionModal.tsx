import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../services/api";
import type { Category, Transaction } from "../types";

export const transactionSchema = z.object({
  title: z.string().min(1, "Title is required."),
  amount: z.number({ invalid_type_error: "Amount must be a number." }).positive("Amount must be positive."),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required."),
  date: z.string().min(1, "Date is required."),
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

const TransactionModal = ({ categories, isLoadingCategories, transaction, onClose, onSuccess, onError }: TransactionModalProps) => {
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
      amount: transaction?.amount ?? 0,
      type: transaction?.type ?? "EXPENSE",
      categoryId: transaction?.category.id.toString() ?? "",
      date: transaction?.date ?? "",
      note: transaction?.note ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: transaction?.title ?? "",
      amount: transaction?.amount ?? 0,
      type: transaction?.type ?? "EXPENSE",
      categoryId: transaction?.category.id.toString() ?? "",
      date: transaction?.date ?? "",
      note: transaction?.note ?? "",
    });
  }, [transaction, reset]);

  const typeValue = watch("type");

  const submitHandler = async (values: TransactionFormValues) => {
    try {
      const payload = {
        title: values.title,
        amount: values.amount,
        type: values.type,
        categoryId: Number(values.categoryId),
        date: values.date,
        note: values.note,
      };

      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
        onSuccess("Transaction updated successfully.");
      } else {
        await api.post("/transactions", payload);
        onSuccess("Transaction created successfully.");
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unable to save transaction.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="transaction-modal-title" className="text-2xl font-semibold text-slate-900">
              {transaction ? "Edit transaction" : "Add transaction"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">Complete the form to save the transaction details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-100 p-3 text-slate-700 transition hover:bg-slate-200"
            aria-label="Close transaction modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="title">
              Title
              <input
                id="title"
                type="text"
                {...register("title")}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700" htmlFor="amount">
              Amount
              <input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          </div>

          {errors.title && <p className="text-sm text-rose-500">{errors.title.message}</p>}
          {errors.amount && <p className="text-sm text-rose-500">{errors.amount.message}</p>}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Type</p>
              <div className="flex gap-3">
                {(["INCOME", "EXPENSE"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValue("type", option)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      typeValue === option
                        ? option === "INCOME"
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                        : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {option === "INCOME" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700" htmlFor="categoryId">
              Category
              <select
                id="categoryId"
                {...register("categoryId")}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {errors.categoryId && <p className="text-sm text-rose-500">{errors.categoryId.message}</p>}

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="date">
              Date
              <input
                id="date"
                type="date"
                {...register("date")}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700" htmlFor="note">
              Note
              <textarea
                id="note"
                rows={4}
                {...register("note")}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
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
