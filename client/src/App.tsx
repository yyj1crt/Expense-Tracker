import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-900 text-slate-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-white text-slate-900 p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
