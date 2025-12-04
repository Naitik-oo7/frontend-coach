// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ChatPage from "./pages/ChatPage";
import AdminPermissionManager from "./components/AdminPermissionManager";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  // Show nothing while validating auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// New component to protect admin-only routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show nothing while validating auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If not admin, redirect to chat
  if (user.role !== "admin") return <Navigate to="/chat" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/permissions"
        element={
          <AdminRoute>
            <AdminPermissionManager />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
};

export default App;
