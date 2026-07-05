import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student",
  RECRUITER: "/recruiter",
  PLACEMENT_OFFICER: "/admin",
};

export const RoleHomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? ROLE_HOME[user.role] : "/login"} replace />;
};
