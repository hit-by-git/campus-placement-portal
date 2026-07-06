import { Outlet } from "react-router-dom";
import { SubNav } from "../../components/layout/SubNav";

export const StudentLayout = () => (
  <div>
    <SubNav
      items={[
        { to: "/student", label: "Dashboard", end: true },
        { to: "/student/profile", label: "Profile" },
        { to: "/student/drives", label: "Drives" },
        { to: "/student/applications", label: "Applications" },
      ]}
    />
    <Outlet />
  </div>
);
