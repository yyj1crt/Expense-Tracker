import { useMemo, useState } from "react";
import { useUsers } from "../hooks/useUsers";

const UsersPage = (): JSX.Element => {
  const { users, isLoading, error, deleteUser } = useUsers();
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const handleDelete = async (userId: number, userRole: string) => {
    if (userRole === "ADMIN") {
      setActionError("Admin accounts cannot be deleted.");
      return;
    }

    const confirmed = window.confirm("Delete this user and all their transactions? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeletingUserId(userId);

    try {
      await deleteUser(userId);
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || "Unable to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const rows = useMemo(
    () =>
      users.map((user) => (
        <tr key={user.id} className="border-b border-slate-200 last:border-b-0">
          <td className="px-6 py-4 text-sm text-slate-700">{user.name}</td>
          <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
          <td className="px-6 py-4 text-sm text-slate-700">{user.role}</td>
          <td className="px-6 py-4 text-sm text-slate-700">{user._count.transactions}</td>
          <td className="px-6 py-4 text-sm text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</td>
          <td className="px-6 py-4 text-right">
            <button
              disabled={deletingUserId === user.id || user.role === "ADMIN"}
              onClick={() => handleDelete(user.id, user.role)}
              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingUserId === user.id ? "Deleting..." : "Delete"}
            </button>
          </td>
        </tr>
      )),
    [users, deleteUser, deletingUserId]
  );

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">User management</h1>
            <p className="mt-2 text-sm text-slate-500">View, manage, and delete user accounts across the platform.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">Total users: {users.length}</div>
        </div>
      </div>

      {error || actionError ? (
        <div className="rounded-[32px] bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">{error || actionError}</div>
      ) : null}

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.26em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Transactions</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">{rows}</tbody>
          </table>
          {isLoading && <div className="p-6 text-sm text-slate-500">Loading users...</div>}
          {!isLoading && users.length === 0 && <div className="p-6 text-sm text-slate-500">No user accounts were found.</div>}
        </div>
      </div>
    </section>
  );
};

export default UsersPage;
