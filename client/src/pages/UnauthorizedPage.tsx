import { Link } from "react-router-dom";

export const UnauthorizedPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Access denied</h1>
    <p className="text-slate-500 dark:text-slate-400">
      You don't have permission to view this page.
    </p>
    <Link to="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
      Go back home
    </Link>
  </div>
);
