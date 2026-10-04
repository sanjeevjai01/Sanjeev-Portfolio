// ==========================================
// APPLICATION ROUTES
// ==========================================

import { Routes, Route } from "react-router-dom";

import AdminLogin from "../admin/AdminLogin";
import AdminDashboard from "../admin/AdminDashboard";
import ProtectedRoute from "../admin/ProtectedRoute";

// ==========================================
// ROUTES COMPONENT
// ==========================================

function AppRoutes() {
  return (
    <Routes>

      {/* ==========================================
          ADMIN LOGIN
          ========================================== */}

      <Route
        path="/admin"
        element={<AdminLogin />}
      />


      {/* ==========================================
          ADMIN DASHBOARD
          ========================================== */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default AppRoutes;