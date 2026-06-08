// feat: sidebar navigation with role-aware menu items
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", roles: ["user", "admin"] },
  { href: "/transactions", label: "Transactions", roles: ["user", "admin"] },
  { href: "/categories", label: "Categories", roles: ["admin"] },
];

const Sidebar = (): JSX.Element => {
  const { user, logout } = useAuth();
  const displayName = user?.name ?? "Guest";
  const role = user?.role ?? "visitor";

  return (
    <aside className="flex min-h-screen w-80 flex-col justify-between overflow-hidden bg-[#1e1e2e] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="px-8 py-10">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-3xl bg-indigo-500 text-xl font-semibold text-white shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">SpendWise</p>
            <h1 className="text-2xl font-semibold text-white">Finance hub</h1>
          </div>
        </div>

        <nav aria-label="Primary" className="space-y-2">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-3xl px-5 py-3 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#1e1e2e] ${
                    isActive
                      ? "bg-indigo-500/15 text-white shadow-lg shadow-indigo-500/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </div>

      <div className="border-t border-white/10 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-800 text-lg font-semibold text-indigo-300">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Log out of your account"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
