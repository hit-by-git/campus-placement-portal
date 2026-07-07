import { Outlet } from "react-router-dom";
import { SubNav } from "../../components/layout/SubNav";

export const RecruiterLayout = () => (
  <div>
    <SubNav
      items={[
        { to: "/recruiter", label: "Dashboard", end: true },
        { to: "/recruiter/company", label: "Company" },
        { to: "/recruiter/drives", label: "Drives" },
      ]}
    />
    <Outlet />
  </div>
);
