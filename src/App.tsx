import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAppDispatch, useAppSelector } from "./store/hooks";
import { refreshSession } from "./store/slices/authSlice";

// Pages
import Login from "./pages/Login";

// Route Guards
import ProtectedRoute from "./route/ProtectedRoute";

// Layouts & Pages
import { SuperAdminLayout } from "./components/superadmin/SuperAdminLayout";
import { SuperAdminDashboard } from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminTasks from "./pages/superadmin/SuperAdminTasks";

import UserLayout from "./components/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserTasks from "./pages/user/UserTasks";
import UserComplete from "./pages/user/UserComplete";
import UserProfile from "./pages/user/UserProfile";
import SuperAdminSubmitted from "./pages/superadmin/SuperAdminSubmitted";
import { injectDispatch } from "./api/axios";

function App() {
  const dispatch = useAppDispatch();
  const { user, isCheckingAuth } = useAppSelector((state) => state.auth);


useEffect(() => {
  injectDispatch(dispatch); // 🔹 needed for Axios interceptors
}, [dispatch]);

useEffect(() => {
  dispatch(refreshSession());
}, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-black text-emerald-900 uppercase tracking-[0.2em] animate-pulse">
            Authenticating Session...
          </div>
        </div>
      </div>
    );
  }

  const renderLoginOrRedirect = () => {
    if (!user) return <Login />;

    switch (user.role.toLowerCase()) {
      case "superadmin":
        return <Navigate to="/super-admin" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/user" replace />; // Changed to /user to match nested structure
    }
  };

  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={renderLoginOrRedirect()} />

        {/* ================= SUPER ADMIN ================= */}
        <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="tasks" element={<SuperAdminTasks />} />
            <Route path="submitted" element={<SuperAdminSubmitted />} />
          </Route>
        </Route>

        {/* ================= USER ================= */}
        {/* USER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user" element={<UserLayout />}>
            {/* These routes render inside UserLayout's <Outlet /> */}
            <Route index element={<UserDashboard />} /> {/* /user */}
            <Route path="assigned" element={<UserTasks />} />{" "}
            {/* /user/assigned */}
            <Route path="complete" element={<UserComplete />} />{" "}
            {/* /user/complete */}
            <Route path="profile" element={<UserProfile />} />{" "}
            {/* /user/profile */}
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
