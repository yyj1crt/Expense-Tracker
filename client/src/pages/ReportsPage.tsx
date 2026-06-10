import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid } from "recharts";
import type { Transaction } from "../types";

const ReportsPage = (): JSX.Element => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [range, setRange] = useState("1m");

  useEffect(() => {
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

  const filtered = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    // Use calendar-based ranges so "This Month" is month-to-date
    if (range === "1m") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "3m") {
      cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (range === "6m") {
      cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (range === "1y") {
      cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    } else {
      cutoff = new Date(0);
    }
    return transactions.filter((t) => new Date(t.date) >= cutoff);
  }, [transactions, range]);

  const expenses = useMemo(() => filtered.filter((t) => t.type === "EXPENSE"), [filtered]);

  const daily = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((t) => {
      const day = new Date(t.date).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses]);

  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((t) => map.set(t.category.name, (map.get(t.category.name) || 0) + t.amount));
    return Array.from(map.entries()).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [expenses]);

  const avgDaily = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    if (range === "1m") cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (range === "3m") cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    else if (range === "6m") cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    else if (range === "1y") cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    else cutoff = new Date(0);
    const msPerDay = 1000 * 60 * 60 * 24;
    const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffUtc = Date.UTC(cutoff.getFullYear(), cutoff.getMonth(), cutoff.getDate());
    const days = Math.max(1, Math.floor((nowUtc - cutoffUtc) / msPerDay) + 1);
    const sum = expenses.reduce((s, t) => s + t.amount, 0);
    return sum / days;
  }, [expenses, range]);

  const mostActiveDay = useMemo(() => {
    if (expenses.length === 0) return "-";
    const counts = new Map<number, number>();
    expenses.forEach((t) => {
      const d = new Date(t.date).getDay();
      counts.set(d, (counts.get(d) || 0) + 1);
    });
    let best = 0;
    let bestDay = 0;
    counts.forEach((cnt, day) => {
      if (cnt > best) {
        best = cnt;
        bestDay = day;
      }
    });
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return names[bestDay] || "-";
  }, [expenses]);

  const savingsRate = useMemo(() => {
    const totalIncome = filtered.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    if (totalIncome <= 0) return null;
    return ((totalIncome - totalExpenses) / totalIncome) * 100;
  }, [filtered, expenses]);

  const biggestCategory = topCategories[0]?.name || "-";

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Detailed insights into your spending</p>
        </div>
        <div className="flex items-center gap-3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-slate-500">Avg daily spending</p>
          <div className="mt-2 text-xl font-semibold">{avgDaily.toLocaleString(undefined, { style: "currency", currency: "USD" })}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-slate-500">Biggest expense category</p>
          <div className="mt-2 text-xl font-semibold">{biggestCategory}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-slate-500">Most active day</p>
          <div className="mt-2 text-xl font-semibold">{mostActiveDay}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-slate-500">Savings rate</p>
          <div className="mt-2 text-xl font-semibold">{savingsRate == null ? "-" : `${savingsRate.toFixed(1)}%`}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-900">Daily spending trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid stroke="#e6eef8" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-900">Top 5 spending categories</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topCategories} layout="vertical" margin={{ left: 0, right: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="amount" fill="#ec4899">
                  {topCategories.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx === 0 ? "#f97316" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-900">Recent insights</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">You spent 20% more on Food this month vs last month</div>
          <div className="rounded-2xl border p-4">Your highest spending day was Tuesday</div>
        </div>
      </div>
    </section>
  );
};

export default ReportsPage;
