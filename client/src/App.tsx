// feat: configure client routing and protected layout pages
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import BudgetPage from "./pages/BudgetPage";
import ReportsPage from "./pages/ReportsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UsersPage from "./pages/UsersPage";

function App(): JSX.Element {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/transactions"
          element={
            <AppLayout>
              <TransactionsPage />
            </AppLayout>
          }
        />
        <Route
          path="/categories"
          element={
            <AppLayout allowedRoles={["ADMIN"]}>
              <CategoriesPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AppLayout allowedRoles={["ADMIN"]}>
              <AdminDashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AppLayout allowedRoles={["ADMIN"]}>
              <UsersPage />
            </AppLayout>
          }
        />
        <Route
          path="/budget"
          element={
            <AppLayout>
              <BudgetPage />
            </AppLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
