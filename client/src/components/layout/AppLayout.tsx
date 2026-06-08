// feat: enforce authentication and optional role-based access control in layout
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const AppLayout = ({ children, allowedRoles }: AppLayoutProps): JSX.Element => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/95 px-6 py-5 text-sm font-semibold shadow-soft">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Verifying access...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-900">
      <Sidebar />
      <main className="flex-1 bg-slate-100 p-8 transition duration-300 lg:p-10">{children}</main>
    </div>
  );
};

export default AppLayout;
