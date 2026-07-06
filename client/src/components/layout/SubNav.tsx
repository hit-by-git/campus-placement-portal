import { NavLink } from "react-router-dom";

interface SubNavItem {
  to: string;
  label: string;
  end?: boolean;
}

export const SubNav = ({ items }: { items: SubNavItem[] }) => (
  <nav className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-800">
    {items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`
        }
      >
        {item.label}
      </NavLink>
    ))}
  </nav>
);
