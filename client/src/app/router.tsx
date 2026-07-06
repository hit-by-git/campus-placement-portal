import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { RoleHomeRedirect } from "../components/layout/RoleHomeRedirect";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { RegisterStudentPage } from "../pages/auth/RegisterStudentPage";
import { RegisterRecruiterPage } from "../pages/auth/RegisterRecruiterPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { StudentDashboardPage } from "../pages/student/StudentDashboardPage";
import { RecruiterDashboardPage } from "../pages/recruiter/RecruiterDashboardPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register/student", element: <RegisterStudentPage /> },
  { path: "/register/recruiter", element: <RegisterRecruiterPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <RoleHomeRedirect /> },
          {
            element: <ProtectedRoute allowedRoles={["STUDENT"]} />,
            children: [{ path: "/student", element: <StudentDashboardPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={["RECRUITER"]} />,
            children: [{ path: "/recruiter", element: <RecruiterDashboardPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={["PLACEMENT_OFFICER"]} />,
            children: [{ path: "/admin", element: <AdminDashboardPage /> }],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
