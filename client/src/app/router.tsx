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
import { StudentLayout } from "../pages/student/StudentLayout";
import { StudentDashboardPage } from "../pages/student/StudentDashboardPage";
import { ProfilePage } from "../pages/student/ProfilePage";
import { DrivesPage } from "../pages/student/DrivesPage";
import { ApplicationsPage } from "../pages/student/ApplicationsPage";
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
            children: [
              {
                element: <StudentLayout />,
                children: [
                  { path: "/student", element: <StudentDashboardPage /> },
                  { path: "/student/profile", element: <ProfilePage /> },
                  { path: "/student/drives", element: <DrivesPage /> },
                  { path: "/student/applications", element: <ApplicationsPage /> },
                ],
              },
            ],
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
