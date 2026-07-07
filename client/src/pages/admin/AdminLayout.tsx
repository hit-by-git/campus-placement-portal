import { Outlet } from "react-router-dom";
import { SubNav } from "../../components/layout/SubNav";

export const AdminLayout = () => (
  <div>
    <SubNav
      items={[
        { to: "/admin", label: "Dashboard", end: true },
        { to: "/admin/recruiters", label: "Recruiters" },
        { to: "/admin/students", label: "Students" },
        { to: "/admin/companies", label: "Companies" },
        { to: "/admin/drives", label: "Drives" },
        { to: "/admin/broadcast", label: "Broadcast" },
      ]}
    />
    <Outlet />
  </div>
);
