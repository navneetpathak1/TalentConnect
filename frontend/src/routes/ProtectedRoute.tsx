import { Navigate } from "react-router-dom";
import { authStore } from "@/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: "USER" | "COMPANY" | "ADMIN";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = authStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "ADMIN") {
    // Admin can access all routes
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

