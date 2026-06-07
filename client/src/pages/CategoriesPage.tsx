import type { Category } from "../types";

const categories: Category[] = [
  { id: 1, name: "Operations", color: "bg-indigo-100", icon: "⚙️" },
  { id: 2, name: "Growth", color: "bg-violet-100", icon: "📈" },
  { id: 3, name: "Savings", color: "bg-cyan-100", icon: "💾" },
  { id: 4, name: "Travel", color: "bg-fuchsia-100", icon: "✈️" },
];

const CategoriesPage = () => {
  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Categories</h2>
            <p className="mt-2 text-sm text-slate-500">Manage your category labels and control which groups your transactions appear under.</p>
          </div>
          <button className="rounded-3xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
            Add category
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className={`grid h-14 w-14 place-items-center rounded-3xl ${category.color} text-xl`}>{category.icon}</div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Category</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{category.name}</h3>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <span>Active</span>
              <span>32 items</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesPage;
