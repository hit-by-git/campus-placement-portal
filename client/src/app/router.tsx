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
import { RecruiterLayout } from "../pages/recruiter/RecruiterLayout";
import { RecruiterDashboardPage } from "../pages/recruiter/RecruiterDashboardPage";
import { CompanyPage } from "../pages/recruiter/CompanyPage";
import { RecruiterDrivesPage } from "../pages/recruiter/RecruiterDrivesPage";
import { ApplicantsPage } from "../pages/recruiter/ApplicantsPage";
import { AdminLayout } from "../pages/admin/AdminLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { RecruitersPage } from "../pages/admin/RecruitersPage";
import { StudentsPage } from "../pages/admin/StudentsPage";
import { AdminCompaniesPage } from "../pages/admin/AdminCompaniesPage";
import { AdminDrivesPage } from "../pages/admin/AdminDrivesPage";
import { BroadcastPage } from "../pages/admin/BroadcastPage";

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
            children: [
              {
                element: <RecruiterLayout />,
                children: [
                  { path: "/recruiter", element: <RecruiterDashboardPage /> },
                  { path: "/recruiter/company", element: <CompanyPage /> },
                  { path: "/recruiter/drives", element: <RecruiterDrivesPage /> },
                ],
              },
              { path: "/recruiter/drives/:driveId/applicants", element: <ApplicantsPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["PLACEMENT_OFFICER"]} />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: "/admin", element: <AdminDashboardPage /> },
                  { path: "/admin/recruiters", element: <RecruitersPage /> },
                  { path: "/admin/students", element: <StudentsPage /> },
                  { path: "/admin/companies", element: <AdminCompaniesPage /> },
                  { path: "/admin/drives", element: <AdminDrivesPage /> },
                  { path: "/admin/broadcast", element: <BroadcastPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
