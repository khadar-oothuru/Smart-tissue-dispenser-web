import ChangePassword from "./components/auth/ChangePassword";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/common/Toast";
import AdminLayout from "./components/admin/AdminLayout";
import "./styles/theme.css";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RootRedirect from "./components/common/RootRedirect";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProfile from "./components/Profile/AdminProfile";
import UserManagement from "./components/admin/UserManagement";
import AppLogs from "./components/Logs/AppLogs";

// Page Components
import Devices from "./components/Devices";
import Analytics from "./components/AnalyticsPages/Analytics";
// import Reports from "./components/Reports";
import Settings from "./components/Settings";
import DeviceSummaryPage from "./components/Devices/DeviceSummaryPage";
import Contact from "./components/admin/Contact";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Admin Routes - All routes use AdminLayout */}
              <Route path="/" element={<RootRedirect />} />

              {/* Main Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* User Management */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <UserManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Device Management */}
              <Route
                path="/admin/devices"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Devices />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              {/* Device Summary Page (cards view) */}
              <Route
                path="/admin/devices/summary/:type"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <DeviceSummaryPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Analytics */}
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Analytics />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Logs */}
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AppLogs />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Settings />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Profile */}
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminProfile />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Change Password */}
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />

              {/* Admin Contact (Help & Support) */}
              <Route
                path="/admin/contact"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Contact />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* (Optional) Keep /contact route for non-admin use, or remove if not needed */}
              <Route
                path="/contact"
                element={
                  <ProtectedRoute>
                    <Contact />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route - redirect to admin dashboard */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
