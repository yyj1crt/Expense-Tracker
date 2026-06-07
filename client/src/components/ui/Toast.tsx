import { useEffect } from "react";

export interface ToastProps {
  id: string;
  message: string;
  variant: "success" | "error";
  onDismiss: () => void;
}

const Toast = ({ message, variant, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 3000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`max-w-sm rounded-3xl border px-5 py-4 shadow-lg transition duration-300 ${
        variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
};

export default Toast;
