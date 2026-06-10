import { useAuth } from "../context/AuthContext";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const AdminDashboardPage = (): JSX.Element => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useAdminDashboard();

  const roleChartData = data?.usersByRole.map((entry) => ({
    name: entry.role,
    value: entry.count,
  })) ?? [];

  const transactionChartData = data?.transactionsByType.map((entry) => ({
    type: entry.type,
    amount: entry.totalAmount,
    count: entry.count,
  })) ?? [];

  const pieColors = ["#6366f1", "#22c55e", "#f97316", "#ef4444"];

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">Loading admin dashboard...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6 rounded-[32px] bg-white p-8 shadow-soft">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">Admin dashboard error</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">Unable to access admin analytics</h2>
          <p className="mt-3 text-sm text-slate-500">Please refresh or contact the system administrator.</p>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={refetch}
            className="rounded-3xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Administrator view</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Admin dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Manage users, monitor transactions, and review the organization’s overall financial health.</p>
          </div>
          <div className="rounded-3xl bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700 shadow-sm">
            Signed in as {user?.name ?? "Administrator"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Users</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalUsers ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Total registered accounts</p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Transactions</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalTransactions ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Total transactions across all users</p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Income</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalIncome.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
          <p className="mt-2 text-sm text-slate-500">All income recorded</p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Expenses</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data?.totalExpenses.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
          <p className="mt-2 text-sm text-slate-500">All expenses recorded</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Income vs expenses</h2>
              <p className="mt-2 text-sm text-slate-500">Compare total income and expense amounts across the entire system.</p>
            </div>
          </div>
          <div className="mt-8 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="type" tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip formatter={(value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" })} />
                <Bar dataKey="amount" fill="#6366f1" radius={[12, 12, 0, 0]}>
                  {transactionChartData.map((entry, index) => (
                    <Cell key={entry.type} fill={index === 1 ? "#ef4444" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">User roles</h2>
              <p className="mt-2 text-sm text-slate-500">Breakdown of registered users by role.</p>
            </div>
          </div>
          <div className="mt-8 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={4}
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} users`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Recent user signups</h2>
            <p className="mt-2 text-sm text-slate-500">Latest accounts created on the platform.</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <div className="grid grid-cols-4 gap-4 bg-slate-50 px-6 py-4 text-xs uppercase tracking-[0.25em] text-slate-500">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
          </div>
          {data?.recentUsers.length ? (
            data.recentUsers.map((userItem) => (
              <div key={userItem.id} className="grid grid-cols-4 gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{userItem.name}</span>
                <span>{userItem.email}</span>
                <span>{userItem.role}</span>
                <span>{new Date(userItem.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-sm text-slate-500">No recent users found.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
