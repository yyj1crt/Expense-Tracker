const Settings = () => {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-brand-50 p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-2 text-slate-600">Manage your account, preferences, and notification settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <h3 className="text-xl font-semibold text-slate-900">Profile</h3>
          <p className="mt-3 text-slate-600">Update your name, email, and account settings from one place.</p>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <h3 className="text-xl font-semibold text-slate-900">Notifications</h3>
          <p className="mt-3 text-slate-600">Set alerts for new expenses, monthly summaries, and account activity.</p>
        </div>
      </div>
    </section>
  );
};

export default Settings;
