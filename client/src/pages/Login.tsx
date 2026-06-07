import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log("Login attempt", values);
  };

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div className="rounded-3xl bg-brand-50 p-10 shadow-soft">
        <h2 className="text-3xl font-semibold text-slate-900">Sign in</h2>
        <p className="mt-3 text-slate-600">Secure access to your expense tracker dashboard.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              {...register("email")}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
          </label>

          <button className="w-full rounded-3xl bg-brand-900 px-6 py-3 text-white transition hover:bg-brand-700" type="submit">
            Continue
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
