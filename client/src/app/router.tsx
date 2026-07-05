import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { RoleHomeRedirect } from "../components/layout/RoleHomeRedirect";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { StudentDashboardPage } from "../pages/student/StudentDashboardPage";
import { RecruiterDashboardPage } from "../pages/recruiter/RecruiterDashboardPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
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
