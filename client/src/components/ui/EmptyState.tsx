export const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
    <p className="font-medium text-slate-700 dark:text-slate-300">{title}</p>
    {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
  </div>
);
