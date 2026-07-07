import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { NotificationBell } from "./NotificationBell";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  RECRUITER: "Recruiter",
  PLACEMENT_OFFICER: "Placement Officer",
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="truncate font-semibold text-slate-900 dark:text-slate-100">
          Campus Placement Portal
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {user && <NotificationBell />}

          {user && (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-slate-600 dark:text-slate-300 sm:inline">
                {user.email} · {ROLE_LABEL[user.role]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
