// feat: sidebar navigation with role-aware menu items
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Tag, LogOut, Wallet, PiggyBank, BarChart3, Users, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, key: "transactions" },
  { href: "/budget", label: "Budget Planner", icon: PiggyBank, key: "budget" },
  { href: "/reports", label: "Reports", icon: BarChart3, key: "reports" },
];

const adminNavItems = [
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield, key: "admin-dashboard" },
  { href: "/admin/users", label: "User Management", icon: Users, key: "admin-users" },
  { href: "/categories", label: "Categories", icon: Tag, key: "categories" },
];

const Sidebar = (): JSX.Element => {
  const { user, logout } = useAuth();
  const displayName = user?.name ?? "Guest";
  const role = user?.role ?? "User";

  return (
    <aside className="flex min-h-screen w-64 flex-col justify-between overflow-hidden bg-[#0f172a] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="px-8 py-10">
        <div className="mb-10 flex items-center gap-4 rounded-3xl bg-slate-900/70 px-4 py-4 shadow-lg shadow-indigo-500/10 transition-all duration-200 hover:bg-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-500 text-white shadow-md">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-400">SpendWise</p>
            <h1 className="text-xl font-semibold text-white">Expense tracker</h1>
          </div>
        </div>

        <nav aria-label="Primary" className="space-y-2">
          {(user?.role === "ADMIN" ? adminNavItems : userNavItems).map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-indigo-300 transition-all duration-200 group-hover:bg-indigo-500/20">
                  <IconComponent className="h-5 w-5" />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-700 px-8 py-6">
        <div className="flex items-center gap-4 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-xl font-semibold text-indigo-300 shadow-inner">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-indigo-500 hover:bg-slate-800"
          aria-label="Log out of your account"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
