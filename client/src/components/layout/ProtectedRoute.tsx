import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types";
import { FullPageSpinner } from "../ui/Spinner";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, status } = useAuth();

  if (status === "loading") return <FullPageSpinner />;
  if (status === "unauthenticated" || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
