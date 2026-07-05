export const Spinner = ({ className = "h-6 w-6" }: { className?: string }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400 ${className}`}
  />
);

export const FullPageSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Spinner className="h-10 w-10" />
  </div>
);
