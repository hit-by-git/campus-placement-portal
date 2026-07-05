import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const DashboardLayout = () => (
  <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
    <Navbar />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
      <Outlet />
    </main>
  </div>
);
