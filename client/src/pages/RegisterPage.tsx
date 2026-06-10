import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your name"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// feat: registration page with password confirmation and validation
const RegisterPage = (): JSX.Element => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    setServerError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const errorMessage = await registerUser(values.name, values.email, values.password);
      if (errorMessage) {
        setServerError(errorMessage);
        return;
      }

      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (error: any) {
      console.error("Registration error:", error);
      setServerError("Unable to create your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-[36px] border border-white/10 bg-slate-950/95 p-8 shadow-soft backdrop-blur-lg">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-300/80">SpendWise</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Create your account</h1>
          <p className="mt-3 text-sm text-slate-400">Start tracking spending with a secure, polished experience.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <label className="block text-sm font-medium text-slate-200" htmlFor="name">
            Name
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...registerForm("name")}
              aria-invalid={errors.name ? "true" : "false"}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          {errors.name && <p className="mt-2 text-sm text-rose-400">{errors.name.message}</p>}

          <label className="block text-sm font-medium text-slate-200" htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...registerForm("email")}
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
              autoComplete="new-password"
              {...registerForm("password")}
              aria-invalid={errors.password ? "true" : "false"}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          {errors.password && <p className="mt-2 text-sm text-rose-400">{errors.password.message}</p>}

          <label className="block text-sm font-medium text-slate-200" htmlFor="confirmPassword">
            Confirm password
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...registerForm("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          {errors.confirmPassword && <p className="mt-2 text-sm text-rose-400">{errors.confirmPassword.message}</p>}

          {serverError && (
            <div className="rounded-3xl bg-rose-950/80 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-500/30">
              {serverError}
            </div>
          )}
          {successMessage && <p className="text-center text-sm text-emerald-300">{successMessage}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-white transition hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
