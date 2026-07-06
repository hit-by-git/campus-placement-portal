import type { HTMLAttributes } from "react";

export const Card = ({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    {...props}
  />
);
