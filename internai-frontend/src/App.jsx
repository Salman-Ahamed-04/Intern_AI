import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/auth";
import { ThemeProvider } from "./store/theme";
import { ToastProvider } from "./lib/toast";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/pages/Dashboard";
import Applications from "./components/pages/Applications";
import Matches from "./components/pages/Matches";
import Companies from "./components/pages/Companies";
import Candidates from "./components/pages/Candidates";
import Interviews from "./components/pages/Interviews";
import Analytics from "./components/pages/Analytics";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import "./index.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-muted)", fontSize: 14 }}>
      Loading...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="matches"      element={<Matches />} />
        <Route path="companies"    element={<Companies />} />
        <Route path="candidates"   element={<Candidates />} />
        <Route path="interviews"   element={<Interviews />} />
        <Route path="analytics"    element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
