import { NavLink } from "react-router-dom";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/settings", label: "Settings" },
  { href: "/login", label: "Login" },
];

const Sidebar = () => {
  return (
    <aside className="w-72 bg-brand-800 p-8 text-brand-50 shadow-soft">
      <div className="mb-10">
        <div className="mb-3 text-sm uppercase tracking-[0.2em] text-brand-500">
          Expense Tracker
        </div>
        <h1 className="text-3xl font-semibold">Control panel</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 transition ${
                isActive ? "bg-brand-900 text-white" : "text-brand-100 hover:bg-brand-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
