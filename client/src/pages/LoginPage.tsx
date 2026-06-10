import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// feat: login page with validation and secure error messaging
const LoginPage = (): JSX.Element => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setServerError(null);
    setIsLoading(true);

    try {
      const errorMessage = await loginUser(values.email, values.password);
      if (errorMessage) {
        setServerError(errorMessage);
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      setServerError("Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-[36px] border border-white/10 bg-slate-950/95 p-8 shadow-soft backdrop-blur-lg">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-300/80">SpendWise</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-3 text-sm text-slate-400">Sign in to manage your budget, transactions, and category insights.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <label className="block text-sm font-medium text-slate-200" htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          {errors.email && <p className="mt-2 text-sm text-rose-400">{errors.email.message}</p>}

          <label className="block text-sm font-medium text-slate-200" htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          {errors.password && <p className="mt-2 text-sm text-rose-400">{errors.password.message}</p>}

          {serverError && <p className="text-center text-sm text-rose-400">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New to SpendWise?{' '}
          <Link to="/register" className="font-semibold text-white transition hover:text-indigo-300">
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-slate-500">
          Admin login: <span className="font-semibold text-white">admin@spendwise.local</span> / <span className="font-semibold text-white">Admin@2026!</span>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
