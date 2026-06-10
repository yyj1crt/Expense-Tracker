import { useCategories } from "../hooks/useCategories";

const CategoriesPage = () => {
  const { categories, isLoading, error, refetch } = useCategories();

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Categories</h2>
            <p className="mt-2 text-sm text-slate-500">Manage the category labels for the application and view all admin-only categories.</p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="rounded-3xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Refresh categories
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[32px] bg-rose-50 p-6 text-sm text-rose-700 shadow-soft">Unable to load categories: {error}</div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[32px] bg-slate-100 p-6 shadow-soft animate-pulse" />
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-3xl bg-slate-100 text-xl">{category.icon}</div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Category</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{category.name}</h3>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>Transactions</span>
                <span>{category._count?.transactions ?? 0}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[32px] bg-white p-6 text-sm text-slate-500 shadow-soft">No categories found. Admin categories will appear once they are created.</div>
        )}
      </div>
    </section>
  );
};

export default CategoriesPage;
