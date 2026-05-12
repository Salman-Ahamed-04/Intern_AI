import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/auth";
import { ThemeProvider } from "./store/theme";
import { ToastProvider } from "./lib/toast";
import Layout from "./components/layout/Layout";

// Shared pages
import Dashboard    from "./components/pages/Dashboard";
import Analytics    from "./components/pages/Analytics";
import Login        from "./components/pages/Login";
import Register     from "./components/pages/Register";
import InternshipDetail from "./components/pages/InternshipDetail";

// Admin-only pages
import Applications from "./components/pages/Applications";
import Matches      from "./components/pages/Matches";
import Companies    from "./components/pages/Companies";
import Candidates   from "./components/pages/Candidates";
import Interviews   from "./components/pages/Interviews";

// Student pages
import BrowseInternships from "./components/pages/BrowseInternships";
import MyApplications    from "./components/pages/MyApplications";
import MyMatches         from "./components/pages/MyMatches";
import MyInterviews      from "./components/pages/MyInterviews";
import MyProfile         from "./components/pages/MyProfile";

// Company pages
import CompanyApplicants  from "./components/pages/CompanyApplicants";
import CompanyMatches     from "./components/pages/CompanyMatches";
import CompanyInterviews  from "./components/pages/CompanyInterviews";
import CompanyProfile     from "./components/pages/CompanyProfile";
import PostInternship     from "./components/pages/PostInternship";

import "./index.css";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:"var(--text-muted)", fontSize:14 }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* All roles */}
        <Route path="dashboard"        element={<Dashboard />} />
        <Route path="analytics"        element={<Analytics />} />
        <Route path="internship/:id"   element={<InternshipDetail />} />

        {/* Admin only */}
        <Route path="applications" element={<ProtectedRoute roles={["admin"]}><Applications /></ProtectedRoute>} />
        <Route path="matches"      element={<ProtectedRoute roles={["admin"]}><Matches /></ProtectedRoute>} />
        <Route path="companies"    element={<ProtectedRoute roles={["admin"]}><Companies /></ProtectedRoute>} />
        <Route path="candidates"   element={<ProtectedRoute roles={["admin"]}><Candidates /></ProtectedRoute>} />
        <Route path="interviews"   element={<ProtectedRoute roles={["admin"]}><Interviews /></ProtectedRoute>} />
        {/* Student only */}
        <Route path="browse"           element={<ProtectedRoute roles={["student"]}><BrowseInternships /></ProtectedRoute>} />
        <Route path="my-applications"  element={<ProtectedRoute roles={["student"]}><MyApplications /></ProtectedRoute>} />
        <Route path="my-matches"       element={<ProtectedRoute roles={["student"]}><MyMatches /></ProtectedRoute>} />
        <Route path="my-interviews"    element={<ProtectedRoute roles={["student"]}><MyInterviews /></ProtectedRoute>} />
        <Route path="my-profile"       element={<ProtectedRoute roles={["student"]}><MyProfile /></ProtectedRoute>} />

        {/* Company only */}
        <Route path="post-internship"     element={<ProtectedRoute roles={["company"]}><PostInternship /></ProtectedRoute>} />
        <Route path="company-applicants"  element={<ProtectedRoute roles={["company"]}><CompanyApplicants /></ProtectedRoute>} />
        <Route path="company-matches"     element={<ProtectedRoute roles={["company"]}><CompanyMatches /></ProtectedRoute>} />
        <Route path="company-interviews"  element={<ProtectedRoute roles={["company"]}><CompanyInterviews /></ProtectedRoute>} />
        <Route path="company-profile"     element={<ProtectedRoute roles={["company"]}><CompanyProfile /></ProtectedRoute>} />
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
